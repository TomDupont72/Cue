type RenameMap = Record<string, string>;

export function dropKeys<T extends object, K extends keyof T>(
  object: T,
  keys: readonly K[],
): Omit<T, K> {
  const result = { ...object };

  for (const key of keys) {
    delete result[key];
  }

  return result;
}

type CamelCase<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Head}${Capitalize<CamelCase<Tail>>}`
    : S;

type RenameOrCamelCase<
  Key extends string,
  Rename extends RenameMap,
> = Key extends keyof Rename
  ? Rename[Key]
  : CamelCase<Key>;

export type CamelCaseKeys<
  T,
  Rename extends RenameMap = {},
> = T extends Array<infer Item>
  ? CamelCaseKeys<Item, Rename>[]
  : T extends object
    ? {
        [K in keyof T as K extends string
          ? RenameOrCamelCase<K, Rename>
          : K]: CamelCaseKeys<T[K], Rename>;
      }
    : T;

function toCamelCase(key: string) {
  return key.replace(/_([a-z])/g, (_, letter: string) =>
    letter.toUpperCase(),
  );
}

export function camelCaseKeys<
  T,
  Rename extends RenameMap = {},
>(
  value: T,
  rename: Rename = {} as Rename,
): CamelCaseKeys<T, Rename> {
  if (Array.isArray(value)) {
    return value.map((item) =>
      camelCaseKeys(item, rename),
    ) as CamelCaseKeys<T, Rename>;
  }

  if (
    value !== null &&
    typeof value === "object" &&
    value.constructor === Object
  ) {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => {
        const newKey = rename[key] ?? toCamelCase(key);

        return [newKey, camelCaseKeys(val, rename)];
      }),
    ) as CamelCaseKeys<T, Rename>;
  }

  return value as CamelCaseKeys<T, Rename>;
}