import { Menu } from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from "../ui/navigation-menu";
import { navigationMenuTriggerStyle } from "../ui/navigation-menu-variants";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "../ui/sheet";
import { InstallAppButton } from "../pwa/installAppButton";
import { NAVIGATION_LINK } from "../constants/navigationLink";
import { useTranslation } from "react-i18next";

export function Navigation() {
  const { t } = useTranslation();

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {Object.entries(NAVIGATION_LINK).map(([key, to]) => (
          <NavigationMenuItem key={to}>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              render={
                <NavLink to={to} className="font-bold">
                  {t(`common:navigation.${key}`).toUpperCase()}
                </NavLink>
              }
            />
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export function NavigationMobile() {
  const { t } = useTranslation();

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
          <SheetTitle>{t("common:navigation.title")}</SheetTitle>
        </SheetHeader>

        <nav className="flex h-full flex-col gap-2 px-4">
          {Object.entries(NAVIGATION_LINK).map(([key, to]) => (
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
                      isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    )
                  }
                >
                  {t(`common:navigation.${key}`).toUpperCase()}
                </NavLink>
              }
            />
          ))}
          <div className="mt-auto pb-4">
            <SheetClose render={<InstallAppButton className="w-full md:hidden" />} />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
