import { Menu } from "lucide-react";
import {  NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";
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

const navigation = [
  { label: "DASHBOARD", to: "/dashboard" },
  { label: "SÉRIES", to: "/series" },
  { label: "CALENDRIER", to: "/calendar" },
  { label: "RECHERCHE", to: "/search" },
];

export function Navigation() {
    return (
        <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navigation.map(({ label, to }) => (
                <NavigationMenuItem key={to}>
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle()}
                    render={
                      <NavLink to={to} className="font-bold">
                        {label}
                      </NavLink>
                    }
                  />
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
    )
}

export function NavigationMobile() {
    return (
        <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Ouvrir la navigation"
                >
                  <Menu className="size-5" />
                </Button>
              }
            />

            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>

<nav className="flex flex-col gap-2 px-4">
  {navigation.map(({ label, to }) => (
    <SheetClose
      key={to}
      nativeButton={false}
      render={
        <NavLink
          to={to}
          className={({ isActive }) =>
            cn(
              "rounded-lg px-4 py-3 font-bold transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground",
            )
          }
        >
          {label}
        </NavLink>
      }
    />
  ))}
</nav>
            </SheetContent>
          </Sheet>
    )
}