import { Container } from "./container";
import { NavigationFooter } from "./navigation";

export default function Footer() {
  return (
    <footer className="border-t">
      <Container className="flex min-h-16 items-center text-sm text-muted-foreground">
        <NavigationFooter />
      </Container>
    </footer>
  );
}
