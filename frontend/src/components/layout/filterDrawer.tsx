import { Button } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger
} from "../ui/drawer";
import { SlidersHorizontalIcon } from "lucide-react";
import { Heading } from "./heading";
import { useMediaQuery } from "@base-ui/react/unstable-use-media-query";
import { useTranslation } from "react-i18next";
import { Text } from "./text";
import { Fragment } from "react/jsx-runtime";
import { ScrollArea } from "../ui/scroll-area";

import type { Dispatch, SetStateAction } from "react";
import type { TFunction } from "i18next";

type Filters = Map<string, Record<string, { checked: boolean; length: number }>>;

type FilterDrawerProps<T> = {
  filters: Filters;
  filterNames: Record<string, string>;
  onFiltersChange: Dispatch<SetStateAction<Filters>>;
  listToFilter: T[];
  onListToFilterChange: (listToFilter: T[]) => void;
  filterFunction: (
    filters: Filters,
    filterNames: Record<string, string>,
    listToFilter: T[],
    t: TFunction
  ) => T[];
};

export default function FilterDrawer<T>({
  filters,
  filterNames,
  onFiltersChange,
  listToFilter,
  onListToFilterChange,
  filterFunction
}: FilterDrawerProps<T>) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 48rem)", { noSsr: true });

  return (
    <Drawer swipeDirection={isMobile ? "down" : "right"}>
      <DrawerTrigger
        render={
          <Button variant="outline" size="lg">
            <SlidersHorizontalIcon />
            <Heading level={4}>{t("common:labels.filters")}</Heading>
          </Button>
        }
      />
      <DrawerContent className="data-[swipe-axis=y]:[--drawer-height:var(--drawer-content-max-height)] data-[swipe-axis=x]:min-w-[28rem]">
        <DrawerHeader className="p-4">
          <Heading level={2} className="uppercase">
            {t("common:actions.filterMySeries")}
          </Heading>
        </DrawerHeader>
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col p-6 gap-4">
            {Array.from(filters.entries()).map(([globalCategory, categories]) => (
              <Fragment key={globalCategory}>
                <div className="flex flex-row items-center">
                  <Heading level={4} className="uppercase">
                    {globalCategory}
                  </Heading>
                  <Button
                    variant={
                      Object.values(categories).every(({ checked }) => checked)
                        ? "outline"
                        : "ghost"
                    }
                    onClick={() =>
                      onFiltersChange((lastFilters) => {
                        const nextFilters = structuredClone(lastFilters);
                        const filters = nextFilters.get(globalCategory);

                        if (!filters) {
                          return nextFilters;
                        }

                        for (const category of Object.keys(filters)) {
                          filters[category].checked = !filters[category].checked;
                        }

                        return nextFilters;
                      })
                    }
                  >
                    <Text>Sélection groupée</Text>
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  {Object.entries(categories).map(([category, metadata]) => (
                    <Button
                      key={category}
                      variant={metadata.checked ? "outline" : "ghost"}
                      className="w-full justify-start"
                      size="lg"
                      onClick={() =>
                        onFiltersChange((lastFilters) => {
                          const nextFilters = structuredClone(lastFilters);
                          const filter = nextFilters.get(globalCategory)?.[category];

                          if (filter) {
                            filter.checked = !filter.checked;
                          }

                          return nextFilters;
                        })
                      }
                    >
                      <Text variant="base">{`${category} (${metadata.length})`}</Text>
                    </Button>
                  ))}
                </div>
              </Fragment>
            ))}
          </div>
        </ScrollArea>
        <DrawerFooter className="p-4">
          <DrawerClose
            render={
              <Button size="lg">
                <Heading
                  level={3}
                  className="uppercase"
                  onClick={() =>
                    onListToFilterChange(filterFunction(filters, filterNames, listToFilter, t))
                  }
                >
                  {t("common:actions.apply")}
                </Heading>
              </Button>
            }
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
