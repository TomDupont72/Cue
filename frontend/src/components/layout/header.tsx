import { Link } from "react-router-dom";
import { Container } from "./container";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from "../ui/navigation-menu";
import cueLogo from "@/assets/cue-logo.png";
import { navigationMenuTriggerStyle } from "../ui/navigation-menu-variants";

export default function Header() {
  return (
    <header className="border-b border-border bg-background">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-semibold sm:pr-5 ">
            <img src={cueLogo} className="h-8" />
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  render={
                    <Link to="/dashboard" className="font-bold">
                      DASHBOARD
                    </Link>
                  }
                />
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  render={
                    <Link to="/series" className="font-bold">
                      SÉRIES
                    </Link>
                  }
                />
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  render={
                    <Link to="/calendar" className="font-bold">
                      CALENDRIER
                    </Link>
                  }
                />
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  render={
                    <Link to="/search" className="font-bold">
                      RECHERCHE
                    </Link>
                  }
                />
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
                  <AvatarFallback>LR</AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem>Profil</DropdownMenuItem>
              <DropdownMenuItem>Se déconnecter</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </Container>
    </header>
  );
}
