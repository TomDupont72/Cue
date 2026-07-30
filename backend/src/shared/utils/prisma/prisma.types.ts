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

export type UpsertManyAndFetchOptions<
  TInput extends object,
  TSource extends TInput,
  TUniqueBy extends keyof TInput,
  TResult
> = {
  data: readonly TSource[];
  scalarFields: Readonly<Record<string, keyof TInput>>;
  uniqueBy: TUniqueBy;
  delegate: UpsertManyAndFetchDelegate<TInput, TResult, TUniqueBy>;
};

type UpsertManyAndFetchDelegate<TInput extends object, TResult, TUniqueBy extends keyof TInput> = {
  upsert(args: {
    where: { [Field in TUniqueBy]: TInput[Field] };
    create: TInput;
    update: TInput;
  }): PromiseLike<TResult>;
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

export type DeleteManyAndFetchOptions<TWhere, TResult> = {
  where: TWhere;
  delegate: DeleteManyAndFetchDelegate<TWhere, TResult>;
};

type DeleteManyAndFetchDelegate<TWhere, TResult> = {
  findMany(args: { where: TWhere }): PromiseLike<TResult[]>;
  deleteMany(args: { where: TWhere }): PromiseLike<unknown>;
};

export type PaginationOrder = "asc" | "desc";

export type ComparableCursor = string | number | Date;

export type FindManyPaginatedResult<TResult, TCursor> = {
  items: TResult[];
  nextCursor: TCursor | null;
  hasNextPage: boolean;
};

export type FindManyPaginatedOptions<
  TWhere extends object,
  TResult extends object,
  TCursorField extends keyof TResult
> = {
  where: TWhere;
  limit: number;
  cursor?: TResult[TCursorField];
  cursorField: TCursorField;
  order?: PaginationOrder;

  delegate: {
    findMany(args: { where: object; orderBy: object; take: number }): Promise<TResult[]>;
  };
};
