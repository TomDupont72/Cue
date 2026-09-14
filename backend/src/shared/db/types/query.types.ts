import type { Prisma } from "@/generated/prisma/client.js";


export type Row<T> = Prisma.Result<T, {}, "findMany">[number];
 
export type Where<T> = NonNullable<Prisma.Args<T, "findMany">["where"]>;
 
export type Field<T> = keyof Row<T> & string;