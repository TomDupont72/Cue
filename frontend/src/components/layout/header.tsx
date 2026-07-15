import { Menu } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

import cueLogo from "@/assets/cue-logo.png";
import { cn } from "@/lib/utils";

import { Container } from "./container";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../ui/navigation-menu";
import { navigationMenuTriggerStyle } from "../ui/navigation-menu-variants";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Navigation, NavigationMobile } from "./navigation";

const navigation = [
  { label: "DASHBOARD", to: "/dashboard" },
  { label: "SÉRIES", to: "/series" },
  { label: "CALENDRIER", to: "/calendar" },
  { label: "RECHERCHE", to: "/search" },
];

export default function Header() {
  return (
    <header className="border-b border-border bg-background">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-5">
          <Link to="/dashboard" aria-label="Accueil Cue">
            <img src={cueLogo} alt="Cue" className="h-8 w-auto" />
          </Link>

          <Navigation/>
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
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt=""
                    />
                    <AvatarFallback>TD</AvatarFallback>
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

          <NavigationMobile/>
        </div>
      </Container>
    </header>
  );
}