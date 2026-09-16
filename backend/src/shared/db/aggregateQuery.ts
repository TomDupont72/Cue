import { Prisma } from "@/generated/prisma/client.js";
import { Query } from "@/shared/db/query.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import type { PrismaModel } from "@/shared/db/types/query.types.js";
import type { Projected, Projection, Table } from "@/shared/db/types/aggregate.types.js";
import { aggregateRelations } from "@/shared/db/constants/aggregateTables.js";
import { identifier } from "@/shared/db/aggregateTables.js";

export class AggregateQuery<
  TModel extends PrismaModel,
  TRow extends object,
  TResult extends Projection = Record<string, never>
> extends Query<TModel> {
  private readonly joins: Prisma.Sql[] = [];
  private projection: Projection = {};

  constructor(
    model: TModel,
    private readonly db: PrismaTx,
    private readonly table: Table<TRow>
  ) {
    super(model);
  }

  join<TJoined extends object>(table: Table<TJoined>): this {
    const relation = aggregateRelations.find(
      (candidate) => candidate.from === this.table.$name && candidate.to === table.$name
    )!;

    this.joins.push(Prisma.sql`
      INNER JOIN ${table.$from}
      ON ${relation.left.sql} = ${relation.right.sql}
    `);
    return this;
  }

  select<const TProjection extends Projection>(
    projection: TProjection
  ): AggregateQuery<TModel, TRow, TProjection> {
    this.projection = projection;
    return this as unknown as AggregateQuery<TModel, TRow, TProjection>;
  }

  async first(): Promise<Projected<TResult>> {
    const entries = Object.entries(this.projection);

    const columns = entries.map(
      ([alias, expression]) => Prisma.sql`${expression.sql} AS ${identifier(alias)}`
    );
    const joins = this.joins.length ? Prisma.join(this.joins, " ") : Prisma.empty;

    const query = Prisma.sql`
      SELECT ${Prisma.join(columns, ", ")}
      FROM ${this.table.$from}
      ${joins}
      ${this.sqlWhere(this.table)}
    `;

    const [row] = await this.db.$queryRaw<Record<string, unknown>[]>(query);

    return Object.fromEntries(
      entries.map(([alias, expression]) => [alias, expression.decode(row[alias])])
    ) as Projected<TResult>;
  }
}
