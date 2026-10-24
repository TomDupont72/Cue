import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import {
  USER_SERIES_STATUS_COLOR,
  type UserSeriesStatus
} from "@/features/user/constants/userSeriesStatus";

type StatusBadgeProps = {
  status: UserSeriesStatus;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();

  const statusValues = {
    COMPLETED: {
      text: t("user:series.status.COMPLETED.label"),
      color: USER_SERIES_STATUS_COLOR.COMPLETED
    },
    PLANNED: {
      text: t("user:series.status.PLANNED.label"),
      color: USER_SERIES_STATUS_COLOR.PLANNED
    },
    WATCHING: {
      text: t("user:series.status.WATCHING.label"),
      color: USER_SERIES_STATUS_COLOR.WATCHING
    },
    DROPPED: {
      text: t("user:series.status.DROPPED.label"),
      color: USER_SERIES_STATUS_COLOR.DROPPED
    },
    PAUSED: {
      text: t("user:series.status.PAUSED.label"),
      color: USER_SERIES_STATUS_COLOR.PAUSED
    }
  };

  return <Badge className={statusValues[status].color}>{statusValues[status].text}</Badge>;
}
