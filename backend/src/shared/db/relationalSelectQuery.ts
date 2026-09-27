import { Prisma } from "@/generated/prisma/client.js";
import { queryRelations, type QueryRelation } from "@/shared/db/constants/queryTables.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { Query } from "@/shared/db/query.js";
import { getColumn, identifier } from "@/shared/db/queryTables.js";
import type {
  Column,
  Expression,
  ManyProjection,
  Ordering,
  Predicate,
  Projected,
  Projection,
  ProjectionValue,
  ResultOrder,
  SortDirection,
  Table,
  TableReference
} from "@/shared/db/types/relationalQuery.types.js";
import type { PrismaModel, Where } from "@/shared/db/types/query.types.js";

type AddResult<TCurrent, TAdded> = [TCurrent] extends [never] ? TAdded : TCurrent & TAdded;

type QueryResult<TRow extends object, TResult> = [TResult] extends [never] ? TRow : TResult;

type FirstPer = {
  partition: Prisma.Sql;
  ordering: readonly Ordering[];
};

type CompiledProjection = {
  collection: boolean;
  outputKey: string;
  field?: string;
  sqlAlias: string;
  expression: Expression<unknown>;
  itemExpression?: Expression<unknown>;
};

type JoinStep = {
  cardinality: "one" | "many";
  previous: TableReference;
  relation: QueryRelation;
  table: TableReference;
};

type CollectionPlan = {
  columnAliases: readonly string[];
  outputKey: string;
  path: readonly JoinStep[];
  projection: ManyProjection;
  sqlAlias: string;
};

function isPredicate(condition: object): condition is Predicate {
  return "kind" in condition && condition.kind === "predicate";
}

function isTableReference(value: ProjectionValue): value is TableReference {
  return "$kind" in value && value.$kind === "table";
}

function isManyProjection(value: ProjectionValue): value is ManyProjection {
  return "$kind" in value && value.$kind === "many";
}

export class RelationalSelectQuery<
  TModel extends PrismaModel,
  TRow extends object,
  TResult extends object | never = never
> extends Query<TModel> {
  private readonly joins: JoinStep[] = [];
  private readonly joinedTables: Set<TableReference>;
  private readonly predicates: Predicate[] = [];
  private readonly grouping: Column<unknown>[] = [];
  private projection: Projection = {};
  private firstPerSelection?: FirstPer;
  private resultOrdering: Partial<Record<string, SortDirection>> = {};

  constructor(
    model: TModel,
    private readonly db: PrismaTx,
    private readonly table: Table<TRow>
  ) {
    super(model);
    this.joinedTables = new Set([table]);
  }

  join<TJoined extends object>(table: Table<TJoined>): this {
    for (const step of this.findJoinPath(table)) {
      this.joins.push(step);
      this.joinedTables.add(step.table);
    }

    return this;
  }

  private findJoinPath(target: TableReference): JoinStep[] {
    if (this.joinedTables.has(target)) {
      return [];
    }

    const queue = [...this.joinedTables];
    const visited = new Set(queue);
    const previousByTable = new Map<TableReference, JoinStep>();

    for (let index = 0; index < queue.length; index += 1) {
      const current = queue[index]!;

      for (const relation of queryRelations) {
        const next =
          relation.from === current
            ? relation.to
            : relation.to === current
              ? relation.from
              : undefined;

        if (next === undefined || visited.has(next)) {
          continue;
        }

        const step = {
          cardinality:
            relation.from === current ? relation.toCardinality : relation.fromCardinality,
          previous: current,
          relation,
          table: next
        };
        visited.add(next);
        previousByTable.set(next, step);

        if (next === target) {
          const path: JoinStep[] = [];
          let cursor = target;

          while (!this.joinedTables.has(cursor)) {
            const cursorStep = previousByTable.get(cursor);

            if (cursorStep === undefined) {
              throw new Error(`Unable to reconstruct join path to ${target.$name}`);
            }

            path.unshift(cursorStep);
            cursor = cursorStep.previous;
          }

          return path;
        }

        queue.push(next);
      }
    }

    const sources = [...this.joinedTables].map((joinedTable) => joinedTable.$name).join(", ");
    throw new Error(`Cannot join ${target.$name} from [${sources}]: no relation path found`);
  }

  selectAll(): RelationalSelectQuery<TModel, TRow, AddResult<TResult, TRow>> {
    for (const field of this.table.$columns) {
      this.projection[field] = this.table[field];
    }

    return this as unknown as RelationalSelectQuery<TModel, TRow, AddResult<TResult, TRow>>;
  }

  select<const TProjection extends Projection>(
    projection: TProjection
  ): RelationalSelectQuery<TModel, TRow, AddResult<TResult, Projected<TProjection>>> {
    this.projection = {
      ...this.projection,
      ...projection
    };

    return this as unknown as RelationalSelectQuery<
      TModel,
      TRow,
      AddResult<TResult, Projected<TProjection>>
    >;
  }

  where(condition: Where<TModel>): this;
  where(condition: Predicate): this;
  where(condition: Where<TModel> | Predicate): this {
    if (isPredicate(condition)) {
      this.predicates.push(condition);
      return this;
    }

    return super.where(condition);
  }

  groupBy(...columns: Column<unknown>[]): this {
    this.grouping.push(...columns);
    return this;
  }

  firstPer<TValue>(column: Column<TValue>, ordering: readonly Ordering[]): this {
    this.firstPerSelection = {
      partition: column.sql,
      ordering
    };

    return this;
  }

  orderBy(ordering: ResultOrder<QueryResult<TRow, TResult>>): this {
    this.resultOrdering = ordering;
    return this;
  }

  async all(): Promise<QueryResult<TRow, TResult>[]> {
    const rows = await this.execute();
    return this.decodeRows(rows);
  }

  async first(): Promise<QueryResult<TRow, TResult>> {
    const rows = await this.execute(1);
    const [result] = this.decodeRows(rows);
    return result!;
  }

  private async execute(limit?: number): Promise<Record<string, unknown>[]> {
    return this.db.$queryRaw<Record<string, unknown>[]>(this.toSql(limit));
  }

  private toSql(limit?: number): Prisma.Sql {
    const collectionPlans = this.collectionPlans();

    if (collectionPlans.length > 0 && this.grouping.length > 0) {
      throw new Error("Collection projections cannot be combined with groupBy()");
    }

    const projection = this.compileProjection(collectionPlans);
    const selectedColumns = projection.map(
      ({ sqlAlias, expression }) => Prisma.sql`${expression.sql} AS ${identifier(sqlAlias)}`
    );
    const collectionSteps = new Set(collectionPlans.flatMap(({ path }) => path));
    const regularJoins = this.joins
      .filter((step) => !collectionSteps.has(step))
      .map(
        (step) => Prisma.sql`
          INNER JOIN ${step.table.$from}
          ON ${step.relation.left.sql} = ${step.relation.right.sql}
        `
      );
    const collectionJoins = collectionPlans.map((plan) => this.collectionJoinSql(plan));
    const joinParts = [...regularJoins, ...collectionJoins];
    const joins = joinParts.length ? Prisma.join(joinParts, " ") : Prisma.empty;
    const predicates = [
      ...this.sqlPredicates(this.table),
      ...this.predicates.map((predicate) => predicate.sql)
    ];
    const where = predicates.length
      ? Prisma.sql`WHERE ${Prisma.join(predicates, " AND ")}`
      : Prisma.empty;
    const groupBy = this.grouping.length
      ? Prisma.sql`GROUP BY ${Prisma.join(
          this.grouping.map((column) => column.sql),
          ", "
        )}`
      : Prisma.empty;
    const rowNumber = this.firstPerSelection
      ? Prisma.sql`, ROW_NUMBER() OVER (
          PARTITION BY ${this.firstPerSelection.partition}
          ORDER BY ${Prisma.join(
            this.firstPerSelection.ordering.map((ordering) => ordering.sql),
            ", "
          )}
        ) AS ${identifier("__rowNumber")}`
      : Prisma.empty;

    const innerQuery = Prisma.sql`
      SELECT ${Prisma.join(selectedColumns, ", ")}${rowNumber}
      FROM ${this.table.$from}
      ${joins}
      ${where}
      ${groupBy}
    `;
    const orderBy = this.orderBySql();
    const limitSql = limit === undefined ? Prisma.empty : Prisma.sql`LIMIT ${limit}`;

    if (!this.firstPerSelection) {
      return Prisma.sql`${innerQuery} ${orderBy} ${limitSql}`;
    }

    const outerColumns = projection.map(({ sqlAlias }) => identifier(sqlAlias));

    return Prisma.sql`
      SELECT ${Prisma.join(outerColumns, ", ")}
      FROM (${innerQuery}) AS ${identifier("_result")}
      WHERE ${identifier("__rowNumber")} = 1
      ${orderBy}
      ${limitSql}
    `;
  }

  private orderBySql(): Prisma.Sql {
    const ordering: Prisma.Sql[] = [];

    for (const [field, direction] of Object.entries(this.resultOrdering)) {
      if (direction !== undefined) {
        ordering.push(
          Prisma.sql`${identifier(field)} ${Prisma.raw(direction === "asc" ? "ASC" : "DESC")}`
        );
      }
    }

    return ordering.length ? Prisma.sql`ORDER BY ${Prisma.join(ordering, ", ")}` : Prisma.empty;
  }

  private collectionPlans(): CollectionPlan[] {
    const stepByTable = new Map(this.joins.map((step) => [step.table, step]));
    const plans: CollectionPlan[] = [];

    for (const [outputKey, value] of Object.entries(this.projection)) {
      if (!isManyProjection(value)) {
        continue;
      }

      const reversePath: JoinStep[] = [];
      let cursor = value.table;

      while (cursor !== this.table) {
        const step = stepByTable.get(cursor);

        if (step === undefined) {
          throw new Error(`Collection table ${value.table.$name} must be joined before selection`);
        }

        reversePath.push(step);
        cursor = step.previous;
      }

      const path = reversePath.reverse();
      const firstManyIndex = path.findIndex((step) => step.cardinality === "many");

      if (firstManyIndex === -1) {
        throw new Error(`Collection path to ${value.table.$name} has no to-many relation`);
      }

      const collectionIndex = plans.length;
      plans.push({
        columnAliases: value.table.$columns.map(
          (_field, fieldIndex) => `__collection_${collectionIndex}_${fieldIndex}`
        ),
        outputKey,
        path: path.slice(firstManyIndex),
        projection: value,
        sqlAlias: `__collection_${collectionIndex}`
      });
    }

    const collectionTables = new Set(plans.flatMap(({ path }) => path.map(({ table }) => table)));

    for (const value of Object.values(this.projection)) {
      if (isTableReference(value) && collectionTables.has(value)) {
        throw new Error(
          `Table ${value.$name} cannot be selected as both a row and a collection in one query`
        );
      }
    }

    for (const step of this.joins) {
      if (!collectionTables.has(step.table) && collectionTables.has(step.previous)) {
        throw new Error(`Join to ${step.table.$name} depends on a table loaded as a collection`);
      }
    }

    return plans;
  }

  private collectionJoinSql(plan: CollectionPlan): Prisma.Sql {
    const [firstStep, ...remainingSteps] = plan.path;

    if (firstStep === undefined) {
      throw new Error(`Collection path to ${plan.projection.table.$name} is empty`);
    }

    const requestedOrdering = Object.entries(plan.projection.orderBy).flatMap(
      ([field, direction]) => {
        if (direction === undefined) {
          return [];
        }

        return [
          Prisma.sql`${getColumn(plan.projection.table, field).sql} ${Prisma.raw(
            direction === "asc" ? "ASC" : "DESC"
          )}`
        ];
      }
    );
    const fallbackField = plan.projection.table.$columns[0];
    const ordering =
      requestedOrdering.length > 0
        ? requestedOrdering
        : fallbackField === undefined
          ? []
          : [Prisma.sql`${getColumn(plan.projection.table, fallbackField).sql} ASC`];
    const aggregatedColumns = plan.projection.table.$columns.map((field, fieldIndex) => {
      const column = getColumn(plan.projection.table, field);
      const orderBy = ordering.length
        ? Prisma.sql` ORDER BY ${Prisma.join(ordering, ", ")}`
        : Prisma.empty;

      return Prisma.sql`ARRAY_AGG(${column.sql}${orderBy}) AS ${identifier(
        plan.columnAliases[fieldIndex]!
      )}`;
    });
    const innerJoins = remainingSteps.map(
      (step) => Prisma.sql`
        INNER JOIN ${step.table.$from}
        ON ${step.relation.left.sql} = ${step.relation.right.sql}
      `
    );
    const joins = innerJoins.length ? Prisma.join(innerJoins, " ") : Prisma.empty;

    return Prisma.sql`
      LEFT JOIN LATERAL (
        SELECT ${Prisma.join(aggregatedColumns, ", ")}
        FROM ${firstStep.table.$from}
        ${joins}
        WHERE ${firstStep.relation.left.sql} = ${firstStep.relation.right.sql}
      ) AS ${identifier(plan.sqlAlias)} ON TRUE
    `;
  }

  private decodeRows(rows: Record<string, unknown>[]): QueryResult<TRow, TResult>[] {
    const projection = this.compileProjection(this.collectionPlans());
    const collectionKeys = [
      ...new Set(
        projection.filter(({ collection }) => collection).map(({ outputKey }) => outputKey)
      )
    ];

    if (collectionKeys.length === 0) {
      return rows.map((row) => this.decode(row, projection));
    }

    const nonCollectionProjection = projection.filter(({ collection }) => !collection);
    const collectionProjectionByKey = new Map(
      collectionKeys.map((outputKey) => [
        outputKey,
        projection.filter((item) => item.collection && item.outputKey === outputKey)
      ])
    );

    return rows.map((row) => {
      const result = this.decode(row, nonCollectionProjection) as Record<string, unknown>;

      for (const collectionKey of collectionKeys) {
        const fields = collectionProjectionByKey.get(collectionKey)!;
        const fieldArrays = fields.map(({ sqlAlias }) => {
          const value = row[sqlAlias];

          if (value === null) {
            return [];
          }

          if (!Array.isArray(value)) {
            throw new Error(`Expected an array for collection ${collectionKey}`);
          }

          return value;
        });
        const lengths = new Set(fieldArrays.map(({ length }) => length));

        if (lengths.size > 1) {
          throw new Error(`Collection ${collectionKey} contains misaligned field arrays`);
        }

        const itemCount = fieldArrays[0]?.length ?? 0;
        result[collectionKey] = Array.from({ length: itemCount }, (_unused, itemIndex) =>
          Object.fromEntries(
            fields.map(({ field, itemExpression }, fieldIndex) => [
              field!,
              itemExpression!.decode(fieldArrays[fieldIndex]![itemIndex])
            ])
          )
        );
      }

      return result as QueryResult<TRow, TResult>;
    });
  }

  private decode(
    row: Record<string, unknown>,
    projection = this.compileProjection()
  ): QueryResult<TRow, TResult> {
    const result: Record<string, unknown> = {};

    for (const { outputKey, field, sqlAlias, expression } of projection) {
      const value = expression.decode(row[sqlAlias]);

      if (field === undefined) {
        result[outputKey] = value;
        continue;
      }

      const nested = (result[outputKey] ??= {}) as Record<string, unknown>;
      nested[field] = value;
    }

    return result as QueryResult<TRow, TResult>;
  }

  private compileProjection(collectionPlans = this.collectionPlans()): CompiledProjection[] {
    const entries = Object.entries(this.projection);
    const reservedAliases = new Set([...entries.map(([outputKey]) => outputKey), "__rowNumber"]);
    const projection: CompiledProjection[] = [];
    const collectionPlanByKey = new Map(collectionPlans.map((plan) => [plan.outputKey, plan]));

    for (const [projectionIndex, [outputKey, value]] of entries.entries()) {
      const collection = isManyProjection(value);
      const table = collection ? value.table : value;
      const collectionPlan = collection ? collectionPlanByKey.get(outputKey) : undefined;

      if (collection && collectionPlan === undefined) {
        throw new Error(`Missing collection plan for ${outputKey}`);
      }

      if (!isTableReference(table)) {
        projection.push({
          collection: false,
          outputKey,
          sqlAlias: outputKey,
          expression: table
        });
        continue;
      }

      for (const [fieldIndex, field] of table.$columns.entries()) {
        let sqlAlias = `__nested_${projectionIndex}_${fieldIndex}`;

        while (reservedAliases.has(sqlAlias)) {
          sqlAlias = `_${sqlAlias}`;
        }

        reservedAliases.add(sqlAlias);
        const itemExpression = getColumn(table, field);
        projection.push({
          collection,
          outputKey,
          field,
          sqlAlias,
          expression: collection
            ? {
                sql: Prisma.sql`${identifier(collectionPlan!.sqlAlias)}.${identifier(
                  collectionPlan!.columnAliases[fieldIndex]!
                )}`,
                decode: (value) => value
              }
            : itemExpression,
          itemExpression: collection ? itemExpression : undefined
        });
      }
    }

    return projection;
  }
}
