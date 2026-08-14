import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import { Container } from "@/components/layout/container";
import EpisodeCard from "@/features/episode/components/episodeCard";
import { USER_SERIES_STATUS_LABELS } from "@/features/user/constants/userSeriesStatus";
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
    <Container className="flex flex-1 flex-col py-8 gap-4">
      <div className="flex flex-col mx-auto w-full sm:max-w-9/10 md:max-w-7/10 lg:max-w-7/10 gap-4">
        {userEpisodesFeedQuery.data.watching.length > 0 ? (
          <>
            <h2 className="text-lg font-bold">{USER_SERIES_STATUS_LABELS["WATCHING"]}</h2>
            {userEpisodesFeedQuery.data.watching.map((episode) => (
              <EpisodeCard
                key={episode.id}
                series={{
                  id: episode.seriesId,
                  name: episode.seriesName,
                  tmdbId: episode.seriesTmdbId
                }}
                episode={episode}
                watchedEpisodeIds={new Set()}
                displayName={true}
              />
            ))}{" "}
          </>
        ) : null}

        {userEpisodesFeedQuery.data.paused.length > 0 ? (
          <>
            <h2 className="text-lg font-bold">{USER_SERIES_STATUS_LABELS["PAUSED"]}</h2>
            {userEpisodesFeedQuery.data.paused.map((episode) => (
              <EpisodeCard
                key={episode.id}
                series={{
                  id: episode.seriesId,
                  name: episode.seriesName,
                  tmdbId: episode.seriesTmdbId
                }}
                episode={episode}
                watchedEpisodeIds={new Set()}
                displayName={true}
              />
            ))}{" "}
          </>
        ) : null}

        {userEpisodesFeedQuery.data.dropped.length > 0 ? (
          <>
            <h2 className="text-lg font-bold">{USER_SERIES_STATUS_LABELS["DROPPED"]}</h2>
            {userEpisodesFeedQuery.data.dropped.map((episode) => (
              <EpisodeCard
                key={episode.id}
                series={{
                  id: episode.seriesId,
                  name: episode.seriesName,
                  tmdbId: episode.seriesTmdbId
                }}
                episode={episode}
                watchedEpisodeIds={new Set()}
                displayName={true}
              />
            ))}{" "}
          </>
        ) : null}
      </div>
    </Container>
  );
}
