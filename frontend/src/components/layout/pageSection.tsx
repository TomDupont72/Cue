import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type PageSectionProps = ComponentProps<"section">;

export function PageSection({ className, ...props }: PageSectionProps) {
  return (
    <section className={cn("flex w-full flex-col items-center gap-6", className)} {...props} />
  );
}
