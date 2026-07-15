import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type RoundedCheckboxProps = {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
};

export function RoundedCheckbox({ checked, onChange, className }: RoundedCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
        checked ? "bg-green-500 text-white" : "bg-white text-muted-foreground",
        className
      )}
    >
      <Check className="size-5" />
    </button>
  );
}
