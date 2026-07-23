import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions
} from "@tanstack/react-query";

type OptimisticMutationOptions<TData, TError, TVariables, TCache> = Omit<
  UseMutationOptions<
    TData,
    TError,
    TVariables,
    {
      previousData: TCache | undefined;
      queryKey: QueryKey;
    }
  >,
  "mutationFn" | "onMutate" | "onError"
> & {
  mutationFn: (variables: TVariables) => Promise<TData>;
  getQueryKey: (variables: TVariables) => QueryKey;
  updateCache: (currentData: TCache, variables: TVariables) => TCache;
};

export function useOptimisticMutation<TData, TError = Error, TVariables = void, TCache = unknown>({
  mutationFn,
  getQueryKey,
  updateCache,
  onSuccess,
  onSettled,
  ...options
}: OptimisticMutationOptions<TData, TError, TVariables, TCache>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn,

    onMutate: async (variables) => {
      const queryKey = getQueryKey(variables);

      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<TCache>(queryKey);

      if (previousData !== undefined) {
        queryClient.setQueryData<TCache>(queryKey, updateCache(previousData, variables));
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
      await queryClient.invalidateQueries({
        queryKey: getQueryKey(variables)
      });

      await onSettled?.(data, error, variables, onMutateResult, mutationContext);
    }
  });
}
