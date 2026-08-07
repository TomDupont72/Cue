import { Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

type RoundedCheckboxProps = {
  checked: boolean | "indeterminate";
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export function RoundedCheckbox({ checked, onChange, disabled, className }: RoundedCheckboxProps) {
  const isSelected = checked !== false;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked === "indeterminate" ? "mixed" : checked}
      disabled={disabled}
      onClick={() => onChange?.(checked !== true)}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
        isSelected ? "bg-green-500 text-white" : "bg-white text-muted-foreground",
        className
      )}
    >
      {checked === "indeterminate" ? <Minus className="size-5" /> : <Check className="size-5" />}
    </button>
  );
}
