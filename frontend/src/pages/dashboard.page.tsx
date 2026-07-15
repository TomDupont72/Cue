import { EmptyState } from "@/components/feedback/emptyState";
import { Container } from "@/components/layout/container";

export default function Dashboard() {
  return (
    <Container className="flex flex-1 flex-col py-8">
    <EmptyState title="Le dashboard arrive bientôt !" description="Va donc rechercher une série plutôt."/>
    </Container>
  )
}
