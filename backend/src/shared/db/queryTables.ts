import { Prisma } from "@/generated/prisma/client.js";
import type { Column, Table } from "@/shared/db/types/relationalQuery.types.js";

export function identifier(name: string): Prisma.Sql {
  return Prisma.raw(`"${name.replaceAll('"', '""')}"`);
}

export function defineTable<TRow extends object>(
  name: string,
  alias: string,
  fields: readonly (keyof TRow & string)[]
): Table<TRow> {
  const columns = Object.fromEntries(
    fields.map((field) => [
      field,
      {
        sql: Prisma.sql`${identifier(alias)}.${identifier(field)}`,
        decode: (value: unknown) => value
      }
    ])
  );

  return {
    ...columns,
    $kind: "table",
    $name: name,
    $from: Prisma.sql`${identifier(name)} AS ${identifier(alias)}`,
    $columns: fields
  } as Table<TRow>;
}

export function getColumn(table: { $name: string; $from: Prisma.Sql }, field: string) {
  return (table as unknown as Record<string, Column<unknown>>)[field];
}
