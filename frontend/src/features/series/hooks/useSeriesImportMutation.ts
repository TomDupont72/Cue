import { useMutation, useQueryClient, type MutateOptions } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { getSessionGeneration, isCurrentSessionGeneration } from "@/lib/sessionGeneration";
import { seriesImportPost } from "../api/series.api";
import type { SeriesImportPostResponse } from "../types/series.types";

const pendingImports = new Map<string, Promise<SeriesImportPostResponse>>();

type ImportMutationVariables = {
  tmdbId: number;
  sessionGeneration: number;
};

function importSeriesOnce({
  tmdbId,
  sessionGeneration
}: ImportMutationVariables): Promise<SeriesImportPostResponse> {
  if (!isCurrentSessionGeneration(sessionGeneration)) {
    return Promise.reject(new Error("L'import a été annulé car la session a changé."));
  }

  const pendingImportKey = `${sessionGeneration}:${tmdbId}`;
  const pendingImport = pendingImports.get(pendingImportKey);

  if (pendingImport) {
    return pendingImport;
  }

  const importRequest = seriesImportPost(tmdbId).finally(() => {
    if (pendingImports.get(pendingImportKey) === importRequest) {
      pendingImports.delete(pendingImportKey);
    }
  });

  pendingImports.set(pendingImportKey, importRequest);

  return importRequest;
}

type ImportMutationOptions = MutateOptions<SeriesImportPostResponse, Error, number, number>;
type InternalImportMutationOptions = MutateOptions<
  SeriesImportPostResponse,
  Error,
  ImportMutationVariables,
  number
>;

function guardMutationOptions(
  options: ImportMutationOptions | undefined
): InternalImportMutationOptions | undefined {
  if (!options) {
    return undefined;
  }

  return {
    onSuccess: (data, variables, onMutateResult, context) => {
      if (isCurrentSessionGeneration(variables.sessionGeneration)) {
        options.onSuccess?.(data, variables.tmdbId, onMutateResult, context);
      }
    },
    onError: (error, variables, onMutateResult, context) => {
      if (isCurrentSessionGeneration(variables.sessionGeneration)) {
        options.onError?.(error, variables.tmdbId, onMutateResult, context);
      }
    },
    onSettled: (data, error, variables, onMutateResult, context) => {
      if (isCurrentSessionGeneration(variables.sessionGeneration)) {
        options.onSettled?.(data, error, variables.tmdbId, onMutateResult, context);
      }
    }
  };
}

export function useSeriesImportMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation<SeriesImportPostResponse, Error, ImportMutationVariables, number>({
    mutationKey: [...queryKeys.series.all, "import"],
    mutationFn: importSeriesOnce,
    onMutate: ({ sessionGeneration }) => sessionGeneration,
    retry: false,
    onSuccess: async (result, variables) => {
      if (!isCurrentSessionGeneration(variables.sessionGeneration)) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.series.detail(result.series.id),
        exact: true
      });
    }
  });

  return {
    ...mutation,
    variables: mutation.variables?.tmdbId,
    mutate: (tmdbId: number, options?: ImportMutationOptions): void => {
      const variables = {
        tmdbId,
        sessionGeneration: getSessionGeneration()
      };

      mutation.mutate(variables, guardMutationOptions(options));
    },
    mutateAsync: (
      tmdbId: number,
      options?: ImportMutationOptions
    ): Promise<SeriesImportPostResponse> => {
      const variables = {
        tmdbId,
        sessionGeneration: getSessionGeneration()
      };

      return mutation.mutateAsync(variables, guardMutationOptions(options));
    }
  };
}
