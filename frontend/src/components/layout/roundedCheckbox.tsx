import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { ABSOLUTE_STYLE, type AbsoluteStyle } from "@/components/constants/style";

type RoundedCheckboxProps = {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  absolute?: AbsoluteStyle;
  className?: string;
};

export function RoundedCheckbox({
  checked,
  onChange,
  disabled,
  absolute,
  className
}: RoundedCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer",
        checked ? "bg-green-500 text-white" : "bg-white text-muted-foreground",
        absolute && ABSOLUTE_STYLE[absolute],
        className
      )}
    >
      <Check className="size-5" />
    </button>
  );
}
