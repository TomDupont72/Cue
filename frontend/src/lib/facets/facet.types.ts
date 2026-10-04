export type FacetValue = string | number;

export type FacetGroup = {
  value: FacetValue;
  name: string;
};

export type FacetSelection<T extends FacetValue> =
  { mode: "all" } | { mode: "include"; values: readonly T[] };

export type FacetFilters<TSchema> = {
  [K in keyof TSchema]: TSchema[K] extends FacetValue ? FacetSelection<TSchema[K]> : never;
};

export type FacetCounts<TSchema> = {
  [K in keyof TSchema]: TSchema[K] extends FacetValue ? ReadonlyMap<TSchema[K], number> : never;
};

export type FacetOption<T extends FacetValue> = {
  value: T;
  label: string;
  count: number;
  disabled?: boolean;
};

export type FacetOptions<TSchema> = {
  [K in keyof TSchema]: TSchema[K] extends FacetValue ? readonly FacetOption<TSchema[K]>[] : never;
};

export type FacetLabels<TSchema> = {
  [K in keyof TSchema]: string;
};
