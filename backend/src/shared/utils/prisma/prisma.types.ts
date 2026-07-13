export type CreateManyAndFetchOptions<
  TInput extends object,
  TSource extends TInput,
  TUniqueBy extends keyof TInput | readonly (keyof TInput)[],
  TResult
> = {
  data: readonly TSource[];
  scalarFields: Readonly<Record<string, keyof TInput>>;
  uniqueBy: TUniqueBy;
  delegate: CreateManyAndFetchDelegate<TInput, TResult, UniqueWhere<TInput, TUniqueBy>>;
};

export type UniqueFieldWhere<TInput extends object, TUniqueField extends keyof TInput> = {
  [Field in TUniqueField]: { in: TInput[Field][] };
};

export type UniqueFieldsWhere<
  TInput extends object,
  TUniqueFields extends readonly (keyof TInput)[]
> = {
  OR: Pick<TInput, TUniqueFields[number]>[];
};

export type UniqueWhere<
  TInput extends object,
  TUniqueBy extends keyof TInput | readonly (keyof TInput)[]
> = TUniqueBy extends readonly (keyof TInput)[]
  ? UniqueFieldsWhere<TInput, TUniqueBy>
  : TUniqueBy extends keyof TInput
    ? UniqueFieldWhere<TInput, TUniqueBy>
    : never;

type CreateManyAndFetchDelegate<TInput extends object, TResult, TWhere> = {
  createMany(args: { data: TInput[]; skipDuplicates: boolean }): PromiseLike<unknown>;
  findMany(args: { where: TWhere }): PromiseLike<TResult[]>;
};
