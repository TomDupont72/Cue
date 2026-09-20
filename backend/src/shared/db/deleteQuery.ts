import { Prisma } from "@/generated/prisma/client.js";
import { Query } from "@/shared/db/query.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import type { Table } from "@/shared/db/types/aggregate.types.js";
import type { DeleteWhere, MutationModel } from "@/shared/db/types/mutationQuery.types.js";
import type { Row } from "@/shared/db/types/query.types.js";

export class DeleteQuery<TModel extends MutationModel> extends Query<TModel, DeleteWhere<TModel>> {
  constructor(
    model: TModel,
    private readonly db: PrismaTx,
    private readonly table: Table<Row<TModel>>
  ) {
    super(model);
  }

  async first(): Promise<Row<TModel> | undefined> {
    const [row] = await this.db.$queryRaw<Row<TModel>[]>(Prisma.sql`
      WITH target AS (
        SELECT ctid
        FROM ${this.table.$from}
        ${this.sqlWhere(this.table)}
        LIMIT 1
      )
      DELETE FROM ${this.table.$from}
      WHERE ctid = (SELECT ctid FROM target)
      RETURNING *
    `);

    return row;
  }

  all(): Promise<Row<TModel>[]> {
    return this.db.$queryRaw<Row<TModel>[]>(Prisma.sql`
      DELETE FROM ${this.table.$from}
      ${this.sqlWhere(this.table)}
      RETURNING *
    `);
  }

  async execute(): Promise<number> {
    const result = await this.model.deleteMany({
      where: this.prismaWhere()
    });

    return result.count;
  }
}
