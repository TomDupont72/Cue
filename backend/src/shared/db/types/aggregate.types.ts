import type { Prisma } from "@/generated/prisma/client.js";

export type Column<T> = {
  sql: Prisma.Sql;
  readonly valueType?: T;
};

export type Table<TRow extends object> = {
  $name: string;
  $from: Prisma.Sql;
} & {
  [K in keyof TRow & string]: Column<TRow[K]>;
};

export type Expression<T> = {
  sql: Prisma.Sql;
  decode(value: unknown): T;
};

export type Projection = Record<string, Expression<unknown>>;

export type Projected<TProjection extends Projection> = {
  [K in keyof TProjection]: TProjection[K] extends Expression<infer TValue> ? TValue : never;
};
