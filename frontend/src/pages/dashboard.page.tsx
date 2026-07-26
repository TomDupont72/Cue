import { Container } from "@/components/layout/container";
import { UserSeriesSection } from "@/features/user/components/userSeriesSection";
import { USER_SERIES_STATUS } from "@/features/user/constants/userSeriesStatus";

export default function Dashboard() {
  return (
    <Container className="flex flex-1 flex-col py-8">
      <div className="flex flex-col gap-4">
        {Object.values(USER_SERIES_STATUS).map((status) => (
          <UserSeriesSection key={status} status={status} />
        ))}
      </div>
    </Container>
  );
}
