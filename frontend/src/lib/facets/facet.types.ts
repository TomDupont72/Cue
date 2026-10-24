export type FacetValue = string | number;

export type FacetGroup = {
  value: FacetValue;
  name: string;
};

export type FacetSelection = { mode: "all" } | { mode: "include"; ids: readonly string[] };

export type FacetFilters<TSchema> = {
  [K in keyof TSchema]: TSchema[K] extends FacetValue ? FacetSelection : never;
};

export type FacetMetrics = {
  readonly count: number;
  readonly watchedMinutes: number;
};

export type FacetOptionConfig = {
  limit: number;
  orderBy: keyof FacetMetrics;
};

export type FacetOptionsConfig<TSchema> = Partial<Record<keyof TSchema, FacetOptionConfig>>;

export type FacetMetricsGetter<T extends FacetValue> = {
  get: (values: readonly T[]) => FacetMetrics;
};

export type FacetMetricsBySchema<TSchema> = {
  [K in keyof TSchema]: TSchema[K] extends FacetValue ? FacetMetricsGetter<TSchema[K]> : never;
};

export type FacetOption<T extends FacetValue> = {
  id: string;
  values: readonly T[];
  label: string;
  count: number;
  watchedMinutes: number;
  disabled?: boolean;
};

export type FacetOptions<TSchema> = {
  [K in keyof TSchema]: TSchema[K] extends FacetValue ? readonly FacetOption<TSchema[K]>[] : never;
};

export type FacetOptionValues<TSchema> = {
  [K in keyof TSchema]: TSchema[K] extends FacetValue
    ? ReadonlyMap<string, readonly TSchema[K][]>
    : never;
};

export type FacetLabels<TSchema> = {
  [K in keyof TSchema]: string;
};
