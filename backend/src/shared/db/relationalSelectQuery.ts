import { Prisma } from "@/generated/prisma/client.js";
import { queryRelations } from "@/shared/db/constants/queryTables.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { Query } from "@/shared/db/query.js";
import { getColumn, identifier } from "@/shared/db/queryTables.js";
import type {
  Column,
  Expression,
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
  outputKey: string;
  field?: string;
  sqlAlias: string;
  expression: Expression<unknown>;
};

function isPredicate(condition: object): condition is Predicate {
  return "kind" in condition && condition.kind === "predicate";
}

function isTableReference(value: ProjectionValue): value is TableReference {
  return "$kind" in value && value.$kind === "table";
}

export class RelationalSelectQuery<
  TModel extends PrismaModel,
  TRow extends object,
  TResult extends object | never = never
> extends Query<TModel> {
  private readonly joins: Prisma.Sql[] = [];
  private readonly joinedTables: Set<string>;
  private readonly predicates: Predicate[] = [];
  private projection: Projection = {};
  private firstPerSelection?: FirstPer;
  private resultOrdering: Partial<Record<string, SortDirection>> = {};

  constructor(
    model: TModel,
    private readonly db: PrismaTx,
    private readonly table: Table<TRow>
  ) {
    super(model);
    this.joinedTables = new Set([table.$name]);
  }

  join<TJoined extends object>(table: Table<TJoined>): this {
    const relation = queryRelations.find(
      (candidate) =>
        (this.joinedTables.has(candidate.from) && candidate.to === table.$name) ||
        (this.joinedTables.has(candidate.to) && candidate.from === table.$name)
    )!;

    this.joins.push(Prisma.sql`
      INNER JOIN ${table.$from}
      ON ${relation.left.sql} = ${relation.right.sql}
    `);
    this.joinedTables.add(table.$name);

    return this;
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
    return rows.map((row) => this.decode(row));
  }

  async first(): Promise<QueryResult<TRow, TResult>> {
    const [row] = await this.execute(1);
    return this.decode(row!);
  }

  private async execute(limit?: number): Promise<Record<string, unknown>[]> {
    return this.db.$queryRaw<Record<string, unknown>[]>(this.toSql(limit));
  }

  private toSql(limit?: number): Prisma.Sql {
    const projection = this.compileProjection();
    const selectedColumns = projection.map(
      ({ sqlAlias, expression }) => Prisma.sql`${expression.sql} AS ${identifier(sqlAlias)}`
    );
    const joins = this.joins.length ? Prisma.join(this.joins, " ") : Prisma.empty;
    const predicates = [
      ...this.sqlPredicates(this.table),
      ...this.predicates.map((predicate) => predicate.sql)
    ];
    const where = predicates.length
      ? Prisma.sql`WHERE ${Prisma.join(predicates, " AND ")}`
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

  private decode(row: Record<string, unknown>): QueryResult<TRow, TResult> {
    const result: Record<string, unknown> = {};

    for (const { outputKey, field, sqlAlias, expression } of this.compileProjection()) {
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

  private compileProjection(): CompiledProjection[] {
    const entries = Object.entries(this.projection);
    const reservedAliases = new Set([...entries.map(([outputKey]) => outputKey), "__rowNumber"]);
    const projection: CompiledProjection[] = [];

    for (const [projectionIndex, [outputKey, value]] of entries.entries()) {
      if (!isTableReference(value)) {
        projection.push({
          outputKey,
          sqlAlias: outputKey,
          expression: value
        });
        continue;
      }

      for (const [fieldIndex, field] of value.$columns.entries()) {
        let sqlAlias = `__nested_${projectionIndex}_${fieldIndex}`;

        while (reservedAliases.has(sqlAlias)) {
          sqlAlias = `_${sqlAlias}`;
        }

        reservedAliases.add(sqlAlias);
        projection.push({
          outputKey,
          field,
          sqlAlias,
          expression: getColumn(value, field)
        });
      }
    }

    return projection;
  }
}
