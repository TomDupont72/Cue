import { Prisma } from "@/generated/prisma/client.js";
import type { Column, Expression, Predicate } from "@/shared/db/types/relationalQuery.types.js";

export function sum(column: Column<number>): Expression<number | null> {
  return {
    sql: Prisma.sql`SUM(${column.sql})`,
    decode: (value) => (value === null ? null : Number(value))
  };
}

export function count(column?: Column<unknown>): Expression<number> {
  return {
    sql: column ? Prisma.sql`COUNT(${column.sql})` : Prisma.sql`COUNT(*)`,
    decode: Number
  };
}

export function countWhere(predicate: Predicate): Expression<number> {
  return {
    sql: Prisma.sql`COUNT(*) FILTER (WHERE ${predicate.sql})`,
    decode: Number
  };
}

export function max<T>(column: Column<T>): Expression<T | null> {
  return {
    sql: Prisma.sql`MAX(${column.sql})`,
    decode: (value) => value as T | null
  };
}

export function coalesce(
  expression: Expression<number | null>,
  fallback: number
): Expression<number> {
  return {
    sql: Prisma.sql`COALESCE(${expression.sql}, ${fallback})`,
    decode: Number
  };
}
