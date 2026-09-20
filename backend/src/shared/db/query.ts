import { Prisma } from "@/generated/prisma/client.js";
import { getColumn } from "@/shared/db/aggregateTables.js";
import type { Table } from "@/shared/db/types/aggregate.types.js";
import { PrismaModel, Where } from "@/shared/db/types/query.types.js";

function isInFilter(value: unknown): value is { in: unknown[] } {
  return typeof value === "object" && value !== null && "in" in value && Array.isArray(value.in);
}

export class Query<TModel extends PrismaModel, TWhere extends object = Where<TModel>> {
  protected conditions: TWhere[] = [];

  constructor(protected readonly model: TModel) {}

  where(condition: TWhere): this {
    this.conditions.push(condition);
    return this;
  }

  protected firstCondition(): TWhere {
    return this.conditions[0]!;
  }

  protected prismaWhere(): Where<TModel> {
    return { AND: this.conditions } as unknown as Where<TModel>;
  }

  protected sqlWhere<TRow extends object>(table: Table<TRow>): Prisma.Sql {
    const predicates: Prisma.Sql[] = [];

    for (const condition of this.conditions) {
      for (const [field, value] of Object.entries(condition)) {
        const column = getColumn(table, field);

        if (value === undefined) {
          continue;
        }

        if (value === null) {
          predicates.push(Prisma.sql`${column.sql} IS NULL`);
        } else if (isInFilter(value)) {
          predicates.push(
            value.in.length === 0
              ? Prisma.sql`FALSE`
              : Prisma.sql`${column.sql} IN (${Prisma.join(value.in)})`
          );
        } else {
          predicates.push(Prisma.sql`${column.sql} = ${value}`);
        }
      }
    }

    return predicates.length ? Prisma.sql`WHERE ${Prisma.join(predicates, " AND ")}` : Prisma.empty;
  }
}
