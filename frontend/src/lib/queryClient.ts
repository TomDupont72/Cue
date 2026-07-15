import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/api/errors";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (isApiError(error) && error.status < 500) {
          return false;
        }

        return failureCount < 2;
      },

      refetchOnWindowFocus: false
    },

    mutations: {
      retry: false
    }
  }
});
