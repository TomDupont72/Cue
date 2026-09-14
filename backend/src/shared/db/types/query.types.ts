import type { Prisma } from "@/generated/prisma/client.js";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type PrismaModel = {
  findMany: (...args: any[]) => any;
  findFirst: (...args: any[]) => any;
};

/* eslint-enable @typescript-eslint/no-explicit-any */

export type Row<T> = Prisma.Result<T, Record<never, never>, "findMany">[number];

export type Where<T> = NonNullable<Prisma.Args<T, "findMany">["where"]>;

export type Field<T> = keyof Row<T> & string;
