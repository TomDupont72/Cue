import {
  useMutation,
  useQueryClient,
  type InvalidateQueryFilters,
  type QueryKey,
  type UseMutationOptions
} from "@tanstack/react-query";
import { isSessionExpiredApiError } from "@/api/errors";
import { getSessionGeneration, isCurrentSessionGeneration } from "@/lib/sessionGeneration";

type MutationVariables<TParams, TBody> = [TParams] extends [void]
  ? [TBody] extends [void]
    ? []
    : [body: TBody]
  : [TBody] extends [void]
    ? [params: TParams]
    : [params: TParams, body: TBody];

type SessionScopedMutationVariables<TVariables> = {
  variables: TVariables;
  sessionGeneration: number;
};

type OptimisticMutationContext<TCache> = {
  previousData: TCache | undefined;
  queryKey: QueryKey;
  sessionGeneration: number;
};

type OptimisticMutationOptions<TData, TError, TParams, TBody, TCache> = Omit<
  UseMutationOptions<
    TData,
    TError,
    MutationVariables<TParams, TBody>,
    OptimisticMutationContext<TCache>
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

  type Variables = MutationVariables<TParams, TBody>;
  type ScopedVariables = SessionScopedMutationVariables<Variables>;

  const mutation = useMutation<TData, TError, ScopedVariables, OptimisticMutationContext<TCache>>({
    ...options,
    mutationFn: ({ variables, sessionGeneration }) => {
      if (!isCurrentSessionGeneration(sessionGeneration)) {
        throw new Error("The session changed before the mutation could run");
      }

      return mutationFn(...variables);
    },

    onMutate: async ({ variables, sessionGeneration }) => {
      const queryKey = getOptimisticQueryKey(...variables);

      if (!isCurrentSessionGeneration(sessionGeneration)) {
        return {
          previousData: undefined,
          queryKey,
          sessionGeneration
        };
      }

      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<TCache>(queryKey);

      if (previousData !== undefined && isCurrentSessionGeneration(sessionGeneration)) {
        queryClient.setQueryData<TCache>(queryKey, updateCache(previousData, ...variables));
      }

      return {
        previousData,
        queryKey,
        sessionGeneration
      };
    },

    onError: (error, _variables, context) => {
      if (
        isSessionExpiredApiError(error) ||
        !context ||
        !isCurrentSessionGeneration(context.sessionGeneration)
      ) {
        return;
      }

      if (context?.previousData !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    },

    onSuccess: async (data, scopedVariables, onMutateResult, mutationContext) => {
      if (!onMutateResult || !isCurrentSessionGeneration(onMutateResult.sessionGeneration)) {
        return;
      }

      await onSuccess?.(data, scopedVariables.variables, onMutateResult, mutationContext);
    },

    onSettled: async (data, error, scopedVariables, onMutateResult, mutationContext) => {
      if (
        isSessionExpiredApiError(error) ||
        !onMutateResult ||
        !isCurrentSessionGeneration(onMutateResult.sessionGeneration)
      ) {
        return;
      }

      try {
        await onSettled?.(data, error, scopedVariables.variables, onMutateResult, mutationContext);
      } finally {
        if (isCurrentSessionGeneration(onMutateResult.sessionGeneration)) {
          await Promise.all(
            getInvalidationFilters(...scopedVariables.variables).map((filters) =>
              queryClient.invalidateQueries(filters)
            )
          );
        }
      }
    }
  });

  return {
    ...mutation,
    variables: mutation.variables?.variables,
    mutate: (...variables: Variables): void =>
      mutation.mutate({
        variables,
        sessionGeneration: getSessionGeneration()
      }),
    mutateAsync: (...variables: Variables): Promise<TData> =>
      mutation.mutateAsync({
        variables,
        sessionGeneration: getSessionGeneration()
      })
  };
}
