import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, NavLink } from "react-router-dom";

import {
  NAVIGATION_FOOTER_LINK,
  NAVIGATION_HEADER_LINK
} from "@/components/constants/navigationLink";
import { PageContainer } from "@/components/layout/pageContainer";
import { InstallAppButton } from "@/components/pwa/installAppButton";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu-variants";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function NavigationHeader() {
  const { t } = useTranslation();

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {Object.values(NAVIGATION_HEADER_LINK).map((navigation) => (
          <NavigationMenuItem key={navigation.link}>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              render={
                <NavLink to={navigation.link} className="font-bold">
                  {t(`common:navigation.${navigation.label}`).toUpperCase()}
                </NavLink>
              }
            />
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export function NavigationHeaderMobile() {
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
          {Object.values(NAVIGATION_HEADER_LINK).map((navigation) => (
            <SheetClose
              key={navigation.link}
              nativeButton={false}
              render={
                <NavLink
                  to={navigation.link}
                  className={({ isActive }) =>
                    cn(
                      "rounded-lg px-4 py-3 font-bold transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    )
                  }
                >
                  {t(`common:navigation.${navigation.label}`).toUpperCase()}
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

export function NavigationFooter() {
  const { t } = useTranslation();

  return (
    <PageContainer className="flex-row flex-wrap justify-center gap-4">
      {Object.values(NAVIGATION_FOOTER_LINK).map((navigation) => (
        <Link key={navigation.link} to={navigation.link} className="hover:underline">
          {t(`common:navigation.${navigation.label}`)}
        </Link>
      ))}
    </PageContainer>
  );
}
