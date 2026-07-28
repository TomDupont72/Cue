import { queryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { userDashboardSummaryGet } from "../api/user.api";

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.userDashboard.summary(),
    queryFn: () => userDashboardSummaryGet(),
    staleTime: 5 * 60 * 1000
  });
}
