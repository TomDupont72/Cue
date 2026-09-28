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
    categories: string[];
    category: string;
    onCategoryChange: (category: string) => void
};

export default function GroupButton({ categories, category, onCategoryChange }: GroupButtonProps) {
  return (
    <DropdownMenu>
<DropdownMenuTrigger
  render={
    <Button
      variant="simple"
      className="flex flex-row w-[185px] justify-between"
    >
      <div className="flex flex-row items-center gap-2">
      <ListFilterIcon />
      <Heading level={4}>Par {category}</Heading>
      </div>
      <ChevronDownIcon className="opacity-60" />
    </Button>
        }
      />
      <DropdownMenuContent>
        {categories.map((categoriesItem) => (
          <DropdownMenuItem key={categoriesItem} onClick={() => onCategoryChange(categoriesItem)}>
            <Heading level={4}>{categoriesItem}</Heading>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
