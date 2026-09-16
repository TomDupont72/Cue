import type { Prisma } from "@/generated/prisma/client.js";
import { Row } from "@/shared/db/types/query.types.js";

export type Add<A, B> = [A] extends [never] ? B : A & B;

export type Result<T, R> = [R] extends [never] ? Row<T> : R;

export type OrderBy<T> = NonNullable<Prisma.Args<T, "findMany">["orderBy"]>;

export type Rename<TRow, TMap> = {
  [K in keyof TMap as TMap[K] & string]: K extends keyof TRow ? TRow[K] : never;
};
