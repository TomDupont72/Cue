import {
  useMutation,
  useQueryClient,
  type InvalidateQueryFilters,
  type QueryKey,
  type UseMutationOptions
} from "@tanstack/react-query";

type MutationVariables<TParams, TBody> = [TParams] extends [void]
  ? [TBody] extends [void]
    ? []
    : [body: TBody]
  : [TBody] extends [void]
    ? [params: TParams]
    : [params: TParams, body: TBody];

type OptimisticMutationOptions<TData, TError, TParams, TBody, TCache> = Omit<
  UseMutationOptions<
    TData,
    TError,
    MutationVariables<TParams, TBody>,
    {
      previousData: TCache | undefined;
      queryKey: QueryKey;
    }
  >,
  "mutationFn" | "onMutate" | "onError"
> & {
  mutationFn: (...variables: MutationVariables<TParams, TBody>) => Promise<TData>;
  getOptimisticQueryKey: (...variables: MutationVariables<TParams, TBody>) => QueryKey;
  getInvalidationFilters: (
    ...variables: MutationVariables<TParams, TBody>
  ) => readonly InvalidateQueryFilters[];
  updateCache: (currentData: TCache, ...variables: MutationVariables<TParams, TBody>) => TCache;
};

export function useOptimisticMutation<
  TData,
  TError = Error,
  TParams = void,
  TBody = void,
  TCache = unknown
>({
  mutationFn,
  getOptimisticQueryKey,
  getInvalidationFilters,
  updateCache,
  onSuccess,
  onSettled,
  ...options
}: OptimisticMutationOptions<TData, TError, TParams, TBody, TCache>) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...options,
    mutationFn: (variables: MutationVariables<TParams, TBody>) => mutationFn(...variables),

    onMutate: async (variables) => {
      const queryKey = getOptimisticQueryKey(...variables);

      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<TCache>(queryKey);

      if (previousData !== undefined) {
        queryClient.setQueryData<TCache>(queryKey, updateCache(previousData, ...variables));
      }

      return {
        previousData,
        queryKey
      };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    },

    onSuccess,

    onSettled: async (data, error, variables, onMutateResult, mutationContext) => {
      try {
        await onSettled?.(data, error, variables, onMutateResult, mutationContext);
      } finally {
        await Promise.all(
          getInvalidationFilters(...variables).map((filters) =>
            queryClient.invalidateQueries(filters)
          )
        );
      }
    }
  });

  return {
    ...mutation,
    mutate: (...variables: MutationVariables<TParams, TBody>): void => mutation.mutate(variables),
    mutateAsync: (...variables: MutationVariables<TParams, TBody>): Promise<TData> =>
      mutation.mutateAsync(variables)
  };
}
