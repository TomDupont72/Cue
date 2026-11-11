import { ChevronDownIcon, ListFilterIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Heading } from "@/components/layout/heading";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

type GroupButtonProps = {
  categories: Record<string, string>;
  category: string;
  onCategoryChange: (category: string) => void;
  prefix?: string;
};

export default function GroupDropdownMenu({
  categories,
  category,
  onCategoryChange,
  prefix
}: GroupButtonProps) {
  const { t } = useTranslation();
  const labelPrefix = prefix ?? t("common:labels.by");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="lg" className="flex w-[185px] max-w-full justify-between">
            <div className="flex min-w-0 flex-row items-center gap-2">
              <ListFilterIcon className="shrink-0" />
              <Heading level={4} className="truncate">
                {labelPrefix ? `${labelPrefix} ${category.toLowerCase()}` : category}
              </Heading>
            </div>
            <ChevronDownIcon className="shrink-0 opacity-60" />
          </Button>
        }
      />
      <DropdownMenuContent>
        {Object.entries(categories).map(([categoriesItem, categoriesName]) => (
          <DropdownMenuItem
            variant="default"
            key={categoriesItem}
            onClick={() => onCategoryChange(categoriesItem)}
          >
            <Heading level={4}>{categoriesName}</Heading>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
