import EpisodeCard from "@/features/episode/components/episodeCard";
import { Heading } from "@/components/layout/heading";
import { useTranslation } from "react-i18next";
import type { WatchSectionItem, WatchSectionStatus } from "@/features/user/types/user.types";

type WatchSectionProps = {
  status?: WatchSectionStatus;
  items: WatchSectionItem[];
};

export default function WatchSection({ status, items }: WatchSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      {items.length > 0 ? (
        <>
          {status ? (
            <Heading level={3} className="uppercase">
              {t(`user:series.status.${status}.section`)}
            </Heading>
          ) : null}
          {items.map((item) => (
            <EpisodeCard
              key={item.id}
              series={{ id: item.seriesId, name: item.seriesName }}
              episode={item}
              isWatched={false}
              displayName
            />
          ))}
        </>
      ) : null}
    </>
  );
}
