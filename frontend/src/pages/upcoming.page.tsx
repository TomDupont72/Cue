import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import ContentColumn from "@/components/layout/contentColumn";
import { Heading } from "@/components/layout/heading";
import { PageContainer } from "@/components/layout/pageContainer";
import WatchSection from "@/features/user/components/watchSection";
import { useUserEpisodesUpcoming } from "@/features/user/hooks/useUserEpisodesUpcoming";

export default function Upcoming() {
  const userEpisodesUpcomingQuery = useUserEpisodesUpcoming();

  if (userEpisodesUpcomingQuery.isPending) {
    return <LoadingState />;
  }

  if (userEpisodesUpcomingQuery.isError) {
    return (
      <ErrorState
        error={userEpisodesUpcomingQuery.error}
        onRetry={() => userEpisodesUpcomingQuery.refetch()}
      />
    );
  }

  return (
    <PageContainer className="gap-4">
      <ContentColumn>
        <Heading level={1}>Episodes à venir</Heading>
        <WatchSection items={userEpisodesUpcomingQuery.data.episodes} />
      </ContentColumn>
    </PageContainer>
  );
}
