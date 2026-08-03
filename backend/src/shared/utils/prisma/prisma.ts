import { dropKeys } from "@/shared/utils/object/object.js";
import type {
  CreateManyAndFetchOptions,
  DeleteManyAndFetchOptions,
  FindManyPaginatedOptions,
  FindManyPaginatedResult,
  UpsertManyAndFetchOptions,
  UpsertUniqueWhere,
  UniqueWhere
} from "./prisma.types.js";

const UPSERT_BATCH_SIZE = 25;

function dropUnknownFields<TInput extends object, TSource extends TInput>(
  source: TSource,
  scalarFields: Readonly<Record<string, keyof TInput>>
): TInput {
  const allowedFields = new Set<PropertyKey>(Object.values(scalarFields));
  const unknownFields = Object.keys(source).filter(
    (field) => !allowedFields.has(field)
  ) as (keyof TSource)[];

  return dropKeys(source, unknownFields) as TInput;
}

export async function createManyAndFetch<
  TInput extends object,
  TSource extends TInput,
  TUniqueBy extends keyof TInput | readonly (keyof TInput)[],
  TResult
>({
  data,
  scalarFields,
  uniqueBy,
  delegate
}: CreateManyAndFetchOptions<TInput, TSource, TUniqueBy, TResult>): Promise<TResult[]> {
  if (data.length === 0) {
    return [];
  }

  const sanitizedData = data.map((item) => dropUnknownFields<TInput, TSource>(item, scalarFields));
  const uniqueFields = (Array.isArray(uniqueBy) ? uniqueBy : [uniqueBy]) as (keyof TInput)[];
  const uniqueData = [
    ...new Map(
      sanitizedData.map((item) => [JSON.stringify(uniqueFields.map((field) => item[field])), item])
    ).values()
  ];
  const uniqueField = uniqueBy as keyof TInput;
  const where = (
    Array.isArray(uniqueBy)
      ? {
          OR: uniqueData.map((item) =>
            Object.fromEntries(uniqueFields.map((field) => [field, item[field]]))
          )
        }
      : { [uniqueField]: { in: uniqueData.map((item) => item[uniqueField]) } }
  ) as UniqueWhere<TInput, TUniqueBy>;

  await delegate.createMany({ data: uniqueData, skipDuplicates: true });

  return delegate.findMany({ where });
}

export async function upsertManyAndFetch<
  TInput extends object,
  TUniqueBy extends keyof TInput | readonly (keyof TInput)[],
  TResult
>({
  data,
  scalarFields,
  uniqueBy,
  delegate
}: UpsertManyAndFetchOptions<TInput, TUniqueBy, TResult>): Promise<TResult[]> {
  const sanitizedData = data.map((item) => dropUnknownFields<TInput, TInput>(item, scalarFields));
  const uniqueFields = (Array.isArray(uniqueBy) ? uniqueBy : [uniqueBy]) as (keyof TInput)[];
  const uniqueField = uniqueBy as keyof TInput;
  const upsert = delegate.upsert;
  const uniqueData = [
    ...new Map(
      sanitizedData.map((item) => [JSON.stringify(uniqueFields.map((field) => item[field])), item])
    ).values()
  ];

  const results: TResult[] = [];

  for (let index = 0; index < uniqueData.length; index += UPSERT_BATCH_SIZE) {
    const batch = uniqueData.slice(index, index + UPSERT_BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((item) =>
        upsert({
          where: (Array.isArray(uniqueBy)
            ? {
                [uniqueFields.join("_")]: Object.fromEntries(
                  uniqueFields.map((field) => [field, item[field]])
                )
              }
            : { [uniqueField]: item[uniqueField] }) as UpsertUniqueWhere<TInput, TUniqueBy>,
          create: item,
          update: item
        })
      )
    );

    results.push(...batchResults);
  }

  return results;
}

export async function deleteManyAndFetch<TWhere, TResult>({
  where,
  delegate
}: DeleteManyAndFetchOptions<TWhere, TResult>): Promise<TResult[]> {
  const records = await delegate.findMany({ where });

  if (records.length === 0) {
    return [];
  }

  await delegate.deleteMany({ where });

  return records;
}

export async function findManyPaginated<
  TWhere extends object,
  TResult extends object,
  TCursorField extends keyof TResult
>({
  where,
  limit,
  cursor,
  cursorField,
  order = "desc",
  delegate
}: FindManyPaginatedOptions<TWhere, TResult, TCursorField>): Promise<
  FindManyPaginatedResult<TResult, TResult[TCursorField]>
> {
  const cursorCondition =
    cursor !== undefined
      ? {
          [cursorField]: {
            [order === "desc" ? "lt" : "gt"]: cursor
          }
        }
      : {};

  const records = await delegate.findMany({
    where: {
      AND: [where, cursorCondition]
    },

    orderBy: {
      [cursorField]: order
    },

    take: limit + 1
  });

  const hasNextPage = records.length > limit;
  const items = records.slice(0, limit);
  const lastItem = items.at(-1);

  return {
    items,
    hasNextPage,
    nextCursor: hasNextPage && lastItem ? lastItem[cursorField] : null
  };
}
