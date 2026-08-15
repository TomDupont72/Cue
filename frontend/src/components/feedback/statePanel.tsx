import { useId, type ReactNode } from "react";
import { Heading } from "@/components/layout/heading";
import { Text } from "@/components/layout/text";
import { cn } from "@/lib/utils";

type StatePanelTone = "neutral" | "destructive";

type StatePanelProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  tone?: StatePanelTone;
};

const TONE_STYLES: Record<StatePanelTone, { panel: string; icon: string }> = {
  neutral: {
    panel: "border-dashed",
    icon: "text-muted-foreground"
  },
  destructive: {
    panel: "border-destructive/30 bg-destructive/5",
    icon: "text-destructive"
  }
};

export function StatePanel({
  title,
  description,
  icon,
  action,
  tone = "neutral"
}: StatePanelProps) {
  const titleId = useId();
  const styles = TONE_STYLES[tone];

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "flex min-h-64 flex-col items-center justify-center rounded-xl border px-6 py-12 text-center",
        styles.panel
      )}
    >
      {icon && <div className={cn("mb-4", styles.icon)}>{icon}</div>}

      <Heading id={titleId} level={3}>
        {title}
      </Heading>

      {description && (
        <Text variant="muted" className="mt-1 max-w-md">
          {description}
        </Text>
      )}
      {action && <div className="mt-4">{action}</div>}
    </section>
  );
}
