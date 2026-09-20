import type { Prisma } from "@/generated/prisma/client.js";

export type Expression<T> = {
  sql: Prisma.Sql;
  decode(value: unknown): T;
};

export type Column<T> = Expression<T> & {
  readonly valueType?: T;
};

export type Table<TRow extends object> = {
  $name: string;
  $from: Prisma.Sql;
  $columns: readonly (keyof TRow & string)[];
} & {
  [K in keyof TRow & string]: Column<TRow[K]>;
};

export type Projection = Record<string, Expression<unknown>>;

export type Projected<TProjection extends Projection> = {
  [K in keyof TProjection]: TProjection[K] extends Expression<infer TValue> ? TValue : never;
};

export type Predicate = {
  kind: "predicate";
  sql: Prisma.Sql;
};

export type Ordering = {
  sql: Prisma.Sql;
};

export type SortDirection = "asc" | "desc";

export type ResultOrder<TResult extends object> = Partial<
  Record<keyof TResult & string, SortDirection>
>;
