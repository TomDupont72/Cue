export type RenameMap = Record<string, string>;

export type CamelCase<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Head}${Capitalize<CamelCase<Tail>>}`
  : S;

export type RenameOrCamelCase<
  Key extends string,
  Rename extends RenameMap
> = Key extends keyof Rename ? Rename[Key] : CamelCase<Key>;

export type FieldSelection<T extends object = Record<string, unknown>> = {
  data: T | T[];
  fields: (keyof T)[];
};

export type JoinKey<T> = keyof T | ((item: T) => unknown);

export type JoinSource<T, TValueKey extends keyof T = never, TAlias extends PropertyKey = never> = {
  data: readonly T[];
  key: JoinKey<T>;
  value?: TValueKey;
  as?: TAlias;
};

export type JoinTarget<
  TSource,
  TTarget,
  TValueKey extends keyof TTarget,
  TAlias extends PropertyKey,
  TResult
> = JoinSource<TTarget, TValueKey, TAlias> &
  (
    | { value: TValueKey; select?: never }
    | { value?: never; select: (target: TTarget, source: TSource) => TResult }
    | { value?: never; select?: never }
  );

type Flatten<T> = T extends readonly (infer Item)[] ? Item : T;

type ProjectedValue<T, TValueKey extends keyof T, TAlias extends PropertyKey> = {
  [Key in TAlias]: Flatten<T[TValueKey]>;
};

export type JoinResult<
  TSource,
  TTarget,
  TSourceValueKey extends keyof TSource,
  TSourceAlias extends PropertyKey,
  TTargetValueKey extends keyof TTarget,
  TTargetAlias extends PropertyKey,
  TResult
> = [TSourceValueKey] extends [never]
  ? Flatten<[TTargetValueKey] extends [never] ? TResult : TTarget[TTargetValueKey]>
  : ProjectedValue<TSource, TSourceValueKey, TSourceAlias> &
      ProjectedValue<TTarget, TTargetValueKey, TTargetAlias>;
