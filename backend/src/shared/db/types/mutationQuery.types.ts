import type { Prisma } from "@/generated/prisma/client.js";
import type { PrismaModel } from "@/shared/db/types/query.types.js";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type MutationModel = PrismaModel & {
  create: (...args: any[]) => any;
  createMany: (...args: any[]) => any;
  createManyAndReturn: (...args: any[]) => any;
  updateMany: (...args: any[]) => any;
  updateManyAndReturn: (...args: any[]) => any;
  deleteMany: (...args: any[]) => any;
  upsert: (...args: any[]) => any;
};

/* eslint-enable @typescript-eslint/no-explicit-any */

export type UpdateData<T> = NonNullable<Prisma.Args<T, "updateManyAndReturn">["data"]>;

export type InsertData<T> = NonNullable<Prisma.Args<T, "create">["data"]>;

export type InsertManyData<T> = NonNullable<Prisma.Args<T, "createMany">["data"]>;

export type UpsertWhere<T> = NonNullable<Prisma.Args<T, "upsert">["where"]>;

export type UpsertCreate<T> = NonNullable<Prisma.Args<T, "upsert">["create"]>;

export type UpsertUpdate<T> = NonNullable<Prisma.Args<T, "upsert">["update"]>;
