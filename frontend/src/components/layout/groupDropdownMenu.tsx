import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { Heading } from "./heading";
import { ChevronDownIcon, ListFilterIcon } from "lucide-react";

type GroupButtonProps = {
  categories: Record<string, string>;
  category: string;
  onCategoryChange: (category: string) => void;
};

export default function GroupDropdownMenu({
  categories,
  category,
  onCategoryChange
}: GroupButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="lg" className="flex flex-row w-[185px] justify-between">
            <div className="flex flex-row items-center gap-2">
              <ListFilterIcon />
              <Heading level={4}>Par {category.toLowerCase()}</Heading>
            </div>
            <ChevronDownIcon className="opacity-60" />
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
