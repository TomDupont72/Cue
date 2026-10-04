import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  FacetFilters,
  FacetLabels,
  FacetOption,
  FacetOptions,
  FacetSelection,
  FacetValue
} from "@/lib/facets/facet.types";
import { useMediaQuery } from "@base-ui/react/unstable-use-media-query";
import { SlidersHorizontalIcon } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

type FilterDrawerProps<TSchema extends object> = {
  labels: FacetLabels<TSchema>;
  options: FacetOptions<TSchema>;
  value: FacetFilters<TSchema>;
  onApply: (value: FacetFilters<TSchema>) => void;
  title?: ReactNode;
  triggerLabel?: ReactNode;
  applyLabel?: ReactNode;
  selectAllLabel?: ReactNode;
};

type FacetKey<TSchema> = Extract<keyof TSchema, string>;

export default function FilterDrawer<TSchema extends object>({
  labels,
  options,
  value,
  onApply,
  title,
  triggerLabel,
  applyLabel,
  selectAllLabel
}: FilterDrawerProps<TSchema>) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 48rem)", { noSsr: true });
  const componentId = useId();
  const [open, setOpen] = useState(false);
  const [draftValue, setDraftValue] = useState(value);

  const facetKeys = Object.keys(options) as FacetKey<TSchema>[];

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraftValue(value);
    }

    setOpen(nextOpen);
  };

  const handleFacetChange = (
    facetKey: FacetKey<TSchema>,
    selection: FacetSelection<FacetValue>
  ) => {
    setDraftValue(
      (currentValue) =>
        ({
          ...currentValue,
          [facetKey]: selection
        }) as FacetFilters<TSchema>
    );
  };

  const handleApply = () => {
    onApply(draftValue);
    setOpen(false);
  };

  return (
    <Drawer
      open={open}
      onOpenChange={handleOpenChange}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerTrigger
        render={
          <Button variant="outline" size="lg">
            <SlidersHorizontalIcon aria-hidden="true" />
            <span className="font-semibold">{triggerLabel ?? t("common:labels.filters")}</span>
          </Button>
        }
      />

      <DrawerContent className="data-[swipe-axis=y]:[--drawer-height:var(--drawer-content-max-height)] data-[swipe-axis=x]:min-w-[28rem]">
        <DrawerHeader className="p-4">
          <DrawerTitle className="text-xl font-bold uppercase">
            {title ?? t("common:labels.filters")}
          </DrawerTitle>
        </DrawerHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-6 p-6">
            {facetKeys.map((facetKey) => (
              <FacetSection
                key={facetKey}
                idPrefix={`${componentId}-${facetKey}`}
                label={labels[facetKey]}
                options={options[facetKey] as readonly FacetOption<FacetValue>[]}
                selection={draftValue[facetKey] as FacetSelection<FacetValue>}
                selectAllLabel={selectAllLabel ?? t("common:labels.groupedSelection")}
                onSelectionChange={(selection) => handleFacetChange(facetKey, selection)}
              />
            ))}
          </div>
        </ScrollArea>

        <DrawerFooter className="p-4">
          <Button size="lg" onClick={handleApply}>
            <span className="font-semibold uppercase">
              {applyLabel ?? t("common:actions.apply")}
            </span>
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

type FacetSectionProps = {
  idPrefix: string;
  label: string;
  options: readonly FacetOption<FacetValue>[];
  selection: FacetSelection<FacetValue>;
  selectAllLabel: ReactNode;
  onSelectionChange: (selection: FacetSelection<FacetValue>) => void;
};

function FacetSection({
  idPrefix,
  label,
  options,
  selection,
  selectAllLabel,
  onSelectionChange
}: FacetSectionProps) {
  const selectedValues =
    selection.mode === "all" ? options.map((option) => option.value) : selection.values;
  const selectedValueSet = new Set(selectedValues);
  const allSelected =
    options.length > 0 && options.every((option) => selectedValueSet.has(option.value));
  const someSelected = !allSelected && options.some((option) => selectedValueSet.has(option.value));

  const handleOptionChange = (optionValue: FacetValue, checked: boolean) => {
    const nextSelectedValues = new Set(selectedValues);

    if (checked) {
      nextSelectedValues.add(optionValue);
    } else {
      nextSelectedValues.delete(optionValue);
    }

    if (options.length > 0 && options.every((option) => nextSelectedValues.has(option.value))) {
      onSelectionChange({ mode: "all" });
      return;
    }

    const knownValues = options
      .map((option) => option.value)
      .filter((value) => nextSelectedValues.has(value));
    const knownValueSet = new Set(options.map((option) => option.value));
    const unknownValues = [...nextSelectedValues].filter((value) => !knownValueSet.has(value));

    onSelectionChange({
      mode: "include",
      values: [...knownValues, ...unknownValues]
    });
  };

  const groupCheckboxId = `${idPrefix}-all`;

  return (
    <section aria-labelledby={`${idPrefix}-label`} className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <span id={`${idPrefix}-label`} className="text-base font-semibold uppercase">
          {label}
        </span>

        <label
          htmlFor={groupCheckboxId}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
        >
          <Checkbox
            id={groupCheckboxId}
            checked={allSelected}
            indeterminate={someSelected}
            disabled={options.length === 0}
            onCheckedChange={(checked) =>
              onSelectionChange(checked ? { mode: "all" } : { mode: "include", values: [] })
            }
          />
          <span>{selectAllLabel}</span>
        </label>
      </div>

      <div className="flex flex-col gap-2">
        {options.map((option, index) => {
          const optionId = `${idPrefix}-${index}`;
          const checked = selectedValueSet.has(option.value);

          return (
            <label
              key={`${typeof option.value}-${String(option.value)}`}
              htmlFor={optionId}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg bg-muted px-3 py-2 text-base font-medium transition-colors hover:bg-muted/80 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
            >
              <Checkbox
                id={optionId}
                checked={checked}
                disabled={option.disabled}
                onCheckedChange={(nextChecked) => handleOptionChange(option.value, nextChecked)}
              />
              <span className="min-w-0 flex-1">
                {option.label} ({option.count})
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
