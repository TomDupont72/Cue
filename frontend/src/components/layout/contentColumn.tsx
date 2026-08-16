import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export type ContentColumnProps = ComponentProps<"div">;

export default function ContentColumn({ className, ...props }: ContentColumnProps) {
  return (
    <div
      className={cn("flex flex-col mx-auto w-full sm:max-w-9/10 md:max-w-7/10 gap-4", className)}
      {...props}
    />
  );
}
