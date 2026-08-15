import type { ReactNode } from "react";
import { StatePanel } from "@/components/feedback/statePanel";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return <StatePanel title={title} description={description} icon={icon} action={action} />;
}
