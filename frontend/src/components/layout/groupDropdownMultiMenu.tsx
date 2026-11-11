import type { Key } from "react";

import { ListFilterIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger
} from "@/components/ui/combobox";

type GroupDropdownMultiMenuProps<T> = {
  items: readonly T[];
  value: readonly T[];
  itemToStringLabel: (item: T) => string;
  itemToKey: (item: T) => Key;
  isItemEqualToValue: (item: T, value: T) => boolean;
  onValueChange: (values: T[]) => void;
  allLabel: string;
  searchPlaceholder: string;
  emptyLabel: string;
};

export function GroupDropdownMultiMenu<T>({
  items,
  value,
  itemToStringLabel,
  itemToKey,
  isItemEqualToValue,
  onValueChange,
  allLabel,
  searchPlaceholder,
  emptyLabel
}: GroupDropdownMultiMenuProps<T>) {
  const selectedLabels = value.map(itemToStringLabel);
  const selectedLabel = selectedLabels[0] ?? allLabel;

  return (
    <Combobox<T, true>
      multiple
      autoHighlight
      value={value as T[]}
      items={items as T[]}
      itemToStringLabel={itemToStringLabel}
      isItemEqualToValue={isItemEqualToValue}
      onValueChange={onValueChange}
    >
      <ComboboxTrigger
        render={<Button variant="outline" size="lg" />}
        className="flex w-[185px] max-w-full justify-between"
        title={selectedLabels.join(", ") || undefined}
      >
        <ListFilterIcon className="shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">{selectedLabel}</span>
        {selectedLabels.length > 1 ? (
          <span className="shrink-0 text-muted-foreground">+{selectedLabels.length - 1}</span>
        ) : null}
      </ComboboxTrigger>

      <ComboboxContent>
        <ComboboxInput placeholder={searchPlaceholder} showTrigger={false} />
        {value.length > 0 ? (
          <div className="flex justify-end px-1 pt-1">
            <Button variant="ghost" size="sm" onClick={() => onValueChange([])}>
              Tout effacer
            </Button>
          </div>
        ) : null}
        <ComboboxEmpty>{emptyLabel}</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={itemToKey(item)} value={item}>
              {itemToStringLabel(item)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
