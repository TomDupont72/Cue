import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import cueLogo from "@/assets/cue-logo.png";
import { Container } from "@/components/layout/container";
import { NavigationHeader, NavigationHeaderMobile } from "@/components/layout/navigation";
import { InstallAppButton } from "@/components/pwa/installAppButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/authClient";
import { queryClient } from "@/lib/queryClient";
import { invalidateSessionGeneration } from "@/lib/sessionGeneration";

function getInitials(name: string | undefined): string {
  if (!name) return "NA";

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function Header() {
  const { t } = useTranslation();

  const { data: session } = authClient.useSession();
  const user = session?.user;

  async function signOut() {
    const result = await authClient.signOut();

    if (result.error) {
      return;
    }

    invalidateSessionGeneration();
    queryClient.clear();
  }

  return (
    <header className="border-b border-border bg-background">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-5">
          <Link to="/dashboard" aria-label="Accueil Cue">
            <img src={cueLogo} alt="Cue" className="h-8 w-auto" />
          </Link>

          <NavigationHeader />
        </div>

        <div className="flex items-center gap-2">
          <InstallAppButton className="hidden md:flex" />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="Ouvrir le menu utilisateur"
                >
                  <Avatar className="size-8">
                    {user?.image && <AvatarImage src={user.image} alt="" />}
                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              }
            />

            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem disabled>{user?.name}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => void signOut()}>
                  {t("user:auth.actions.disconnect")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <NavigationHeaderMobile />
        </div>
      </Container>
    </header>
  );
}
