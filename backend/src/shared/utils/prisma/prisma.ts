import { dropKeys } from "@/shared/utils/object/object.js";
import type {
  CreateManyAndFetchOptions,
  DeleteManyAndFetchOptions,
  UniqueWhere
} from "./prisma.types.js";

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
