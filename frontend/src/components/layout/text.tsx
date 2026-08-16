import { TEXT_STYLE, type TextVariant } from "@/components/constants/style";
import { cn } from "@/lib/utils";

type TextProps = React.ComponentProps<"p"> & {
  variant?: TextVariant;
};

export function Text({ variant = "small", className, ...props }: TextProps) {
  return <p className={cn(TEXT_STYLE[variant], className)} {...props} />;
}
