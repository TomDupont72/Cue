import { Link } from "react-router-dom";

import cueLogo from "@/assets/cue-logo.png";

import { Container } from "./container";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { Navigation, NavigationMobile } from "./navigation";
import { authClient } from "@/lib/authClient";
import { queryClient } from "@/lib/queryClient";

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
  const { data: session } = authClient.useSession();
  const user = session?.user;

  async function signOut() {
    await authClient.signOut();
    queryClient.clear();
  }

  return (
    <header className="border-b border-border bg-background">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-5">
          <Link to="/dashboard" aria-label="Accueil Cue">
            <img src={cueLogo} alt="Cue" className="h-8 w-auto" />
          </Link>

          <Navigation />
        </div>

        <div className="flex items-center gap-2">
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
                <DropdownMenuItem onClick={() => void signOut()}>Se déconnecter</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <NavigationMobile />
        </div>
      </Container>
    </header>
  );
}
