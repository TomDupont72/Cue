import { Prisma } from "@/generated/prisma/client.js";
import { getColumn } from "@/shared/db/aggregateTables.js";
import type { Table } from "@/shared/db/types/aggregate.types.js";
import { PrismaModel, Where } from "@/shared/db/types/query.types.js";

export class Query<TModel extends PrismaModel> {
  protected conditions: Where<TModel>[] = [];

  constructor(protected readonly model: TModel) {}

  where(condition: Where<TModel>): this {
    this.conditions.push(condition);
    return this;
  }

  protected prismaWhere(): Where<TModel> {
    return { AND: this.conditions } as unknown as Where<TModel>;
  }

  protected sqlWhere<TRow extends object>(table: Table<TRow>): Prisma.Sql {
    const predicates: Prisma.Sql[] = [];

    for (const condition of this.conditions) {
      for (const [field, value] of Object.entries(condition)) {
        const column = getColumn(table, field);

        if (value === null) {
          predicates.push(Prisma.sql`${column.sql} IS NULL`);
        } else {
          predicates.push(Prisma.sql`${column.sql} = ${value}`);
        }
      }
    }

    return predicates.length ? Prisma.sql`WHERE ${Prisma.join(predicates, " AND ")}` : Prisma.empty;
  }
}
