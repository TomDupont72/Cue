import type { ReactNode } from "react";

import { CircleOff } from "lucide-react";

import { StatePanel } from "@/components/feedback/statePanel";
import { PageContainer } from "@/components/layout/pageContainer";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <PageContainer className="flex justify-center">
      <StatePanel
        title={title}
        description={description}
        icon={icon ? icon : <CircleOff className="size-8" />}
        action={action}
      />
    </PageContainer>
  );
}
