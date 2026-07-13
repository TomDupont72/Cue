import { z } from "zod";
import {
  FieldSelection,
  JoinKey,
  JoinResult,
  JoinSource,
  JoinTarget,
  RenameMap,
  RenameOrCamelCase
} from "./object.types.js";

export function dropKeys<T extends object, K extends keyof T>(
  object: T,
  keys: readonly K[]
): Omit<T, K> {
  const result = { ...object };

  for (const key of keys) {
    delete result[key];
  }

  return result;
}

export function joinBy<
  TSource extends object,
  TTarget extends object,
  TSourceValueKey extends keyof TSource = never,
  TSourceAlias extends PropertyKey = never,
  TTargetValueKey extends keyof TTarget = never,
  TTargetAlias extends PropertyKey = never,
  TResult = TTarget
>(
  source: JoinSource<TSource, TSourceValueKey, TSourceAlias>,
  target: JoinTarget<TSource, TTarget, TTargetValueKey, TTargetAlias, TResult>
): JoinResult<
  TSource,
  TTarget,
  TSourceValueKey,
  TSourceAlias,
  TTargetValueKey,
  TTargetAlias,
  TResult
>[] {
  const getKey = <T>(item: T, key: JoinKey<T>) =>
    typeof key === "function" ? key(item) : item[key];
  const targetsByKey = new Map(target.data.map((item) => [getKey(item, target.key), item]));
  type Result = JoinResult<
    TSource,
    TTarget,
    TSourceValueKey,
    TSourceAlias,
    TTargetValueKey,
    TTargetAlias,
    TResult
  >;

  const result: Result[] = [];

  for (const item of source.data) {
    const match = targetsByKey.get(getKey(item, source.key));

    if (match === undefined) continue;

    if (source.value !== undefined) {
      if (source.as === undefined || target.value === undefined || target.as === undefined) {
        throw new TypeError("Both join sides need a value and an alias");
      }

      const sourceValue = item[source.value];
      const targetValue = match[target.value];
      const sourceValues: unknown[] = Array.isArray(sourceValue) ? sourceValue : [sourceValue];
      const targetValues: unknown[] = Array.isArray(targetValue) ? targetValue : [targetValue];

      for (const sourceValue of sourceValues) {
        for (const targetValue of targetValues) {
          result.push({
            [source.as as PropertyKey]: sourceValue,
            [target.as as PropertyKey]: targetValue
          } as Result);
        }
      }

      continue;
    }

    let selected: unknown;

    if (target.select !== undefined) {
      selected = target.select(match, item);
    } else if (target.value !== undefined) {
      selected = match[target.value];
    } else {
      selected = match;
    }

    const values = Array.isArray(selected) ? selected : [selected];
    result.push(...(values as Result[]));
  }

  return result;
}

export type CamelCaseKeys<T, Rename extends RenameMap = Record<never, never>> = T extends Date
  ? T
  : T extends Array<infer Item>
    ? CamelCaseKeys<Item, Rename>[]
    : T extends object
      ? {
          [K in keyof T as K extends string ? RenameOrCamelCase<K, Rename> : K]: CamelCaseKeys<
            T[K],
            Rename
          >;
        }
      : T;

function toCamelCase(key: string) {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

export function camelCaseKeys<T, Rename extends RenameMap = Record<never, never>>(
  value: T,
  rename: Rename = {} as Rename
): CamelCaseKeys<T, Rename> {
  if (Array.isArray(value)) {
    return value.map((item) => camelCaseKeys(item, rename)) as CamelCaseKeys<T, Rename>;
  }

  if (value !== null && typeof value === "object" && value.constructor === Object) {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => {
        const newKey = rename[key] ?? toCamelCase(key);

        return [newKey, camelCaseKeys(val, rename)];
      })
    ) as CamelCaseKeys<T, Rename>;
  }

  return value as CamelCaseKeys<T, Rename>;
}

export function excludeMissingFields<T extends z.ZodTypeAny>(schema: T, fields: string[]) {
  return z.preprocess((value) => {
    if (!Array.isArray(value)) {
      return value;
    }

    return value.filter((item) => {
      if (typeof item !== "object" || item === null) {
        return false;
      }

      const record = item as Record<string, unknown>;

      return fields.every((field) => record[field] !== null && record[field] !== undefined);
    });
  }, z.array(schema));
}

export function getMany<T extends object>(...selections: FieldSelection[]): T[] {
  const result: T[] = [];

  for (const selection of selections) {
    const items = Array.isArray(selection.data) ? selection.data : [selection.data];

    for (const item of items) {
      for (const field of selection.fields) {
        const selectedValue = item[field];
        const values = Array.isArray(selectedValue) ? selectedValue : [selectedValue];
        result.push(...(values as T[]));
      }
    }
  }

  return result;
}
