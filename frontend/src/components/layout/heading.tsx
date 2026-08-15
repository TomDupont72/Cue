import {
  ABSOLUTE_STYLE,
  HEADING_STYLE,
  type AbsoluteStyle,
  type HeadingLevel
} from "@/components/constants/style";
import { cn } from "@/lib/utils";

type HeadingProps = React.ComponentProps<"h1"> & {
  level?: HeadingLevel;
  absolute?: AbsoluteStyle;
  full?: boolean;
};

export function Heading({ level = 2, absolute, className, full = true, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;

  return (
    <Tag
      className={cn(
        HEADING_STYLE[level],
        absolute && ABSOLUTE_STYLE[absolute],
        full && "w-full",
        className
      )}
      {...props}
    />
  );
}
