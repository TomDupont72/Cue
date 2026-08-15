import type { ComponentProps } from "react";

import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

type PageContainerProps = ComponentProps<typeof Container>;

export function PageContainer({ className, ...props }: PageContainerProps) {
  return <Container className={cn("flex flex-1 flex-col py-8", className)} {...props} />;
}
