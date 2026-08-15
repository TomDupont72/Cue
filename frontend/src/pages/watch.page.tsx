import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import ContentColumn from "@/components/layout/contentColumn";
import { PageContainer } from "@/components/layout/pageContainer";
import WatchSection from "@/features/user/components/watchSection";
import { WATCH_SECTIONS } from "@/features/user/constants/watchSections";
import { useUserEpisodesFeed } from "@/features/user/hooks/useUserEpisodesFeed";

export default function Watch() {
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

  return (
        <PageContainer className="gap-4">
      <ContentColumn>
        {WATCH_SECTIONS.map((section) => (
          <WatchSection key={section} status={section} items={userEpisodesFeedQuery.data[section]} />
        ))}
      </ContentColumn>
      </PageContainer>
  );
}
