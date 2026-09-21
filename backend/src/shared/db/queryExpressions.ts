import { Prisma } from "@/generated/prisma/client.js";
import type { Column, Ordering, Predicate } from "@/shared/db/types/relationalQuery.types.js";

type Operand<T> = {
  kind: "operand";
  sql: Prisma.Sql;
  readonly valueType?: T;
};

function isOperand<T>(value: T | Operand<T>): value is Operand<T> {
  return typeof value === "object" && value !== null && "kind" in value && value.kind === "operand";
}

function operandSql<T>(value: T | Operand<T>): Prisma.Sql {
  return isOperand(value) ? value.sql : Prisma.sql`${value}`;
}

export function dateOnly(value: Date): Operand<Date> {
  const date = value.toISOString().slice(0, 10);

  return {
    kind: "operand",
    sql: Prisma.sql`${date}::date`
  };
}

export function eq<T>(column: Column<T>, value: T | Operand<T>): Predicate {
  return {
    kind: "predicate",
    sql: Prisma.sql`${column.sql} = ${operandSql(value)}`
  };
}

export function ne<T>(column: Column<T>, value: T | Operand<T>): Predicate {
  return {
    kind: "predicate",
    sql: Prisma.sql`${column.sql} <> ${operandSql(value)}`
  };
}

export function gt<T>(
  column: Column<T>,
  value: NonNullable<T> | Operand<NonNullable<T>>
): Predicate {
  return {
    kind: "predicate",
    sql: Prisma.sql`${column.sql} > ${operandSql(value)}`
  };
}

export function lt<T>(
  column: Column<T>,
  value: NonNullable<T> | Operand<NonNullable<T>>
): Predicate {
  return {
    kind: "predicate",
    sql: Prisma.sql`${column.sql} < ${operandSql(value)}`
  };
}

export function asc(column: Column<unknown>): Ordering {
  return {
    sql: Prisma.sql`${column.sql} ASC`
  };
}

export function desc(column: Column<unknown>): Ordering {
  return {
    sql: Prisma.sql`${column.sql} DESC`
  };
}
