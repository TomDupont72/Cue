import { useQuery } from "@tanstack/react-query";

import { userDashboardSummaryGet } from "@/features/user/api/user.api";
import { queryKeys } from "@/lib/queryKeys";

export function useUserDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.userDashboard.summary(),
    queryFn: () => userDashboardSummaryGet(),
    staleTime: 5 * 60 * 1000
  });
}
