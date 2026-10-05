import { EmptyState } from "@/components/feedback/emptyState";
import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import ContentColumn from "@/components/layout/contentColumn";
import { PageContainer } from "@/components/layout/pageContainer";
import WatchSection from "@/features/user/components/watchSection";
import { WATCH_SECTIONS } from "@/features/user/constants/watchSections";
import { useUserEpisodesFeed } from "@/features/user/hooks/useUserEpisodesFeed";
import { useTranslation } from "react-i18next";

export default function Watch() {
  const { t } = useTranslation();

  const userEpisodesFeedQuery = useUserEpisodesFeed();

  if (userEpisodesFeedQuery.isPending) {
    return <LoadingState />;
  }

  if (userEpisodesFeedQuery.isError) {
    return (
      <ErrorState
        error={userEpisodesFeedQuery.error}
        onRetry={() => userEpisodesFeedQuery.refetch()}
      />
    );
  }

  if (
    userEpisodesFeedQuery.data.DROPPED.length === 0 &&
    userEpisodesFeedQuery.data.WATCHING.length === 0 &&
    userEpisodesFeedQuery.data.PAUSED.length === 0
  ) {
    return (
      <EmptyState
        title={t("episode:watch.emptyEpisodesTitle")}
        description={t("episode:watch.emptyEpisodesDescription")}
      />
    );
  }

  return (
    <PageContainer className="gap-4">
      <ContentColumn>
        {WATCH_SECTIONS.map((section) => (
          <WatchSection
            key={section}
            status={section}
            items={userEpisodesFeedQuery.data[section]}
          />
        ))}
      </ContentColumn>
    </PageContainer>
  );
}
