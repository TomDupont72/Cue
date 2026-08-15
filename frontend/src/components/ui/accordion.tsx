import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { accordionTriggerVariants } from "./accordion-variants";

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("not-last:border-b", className)}
      {...props}
    />
  );
}

type AccordionTriggerProps = React.ComponentProps<typeof AccordionPrimitive.Trigger> &
  VariantProps<typeof accordionTriggerVariants> & {
    left?: React.ReactNode;
    right?: React.ReactNode;
  };

function AccordionTrigger({
  className,
  children,
  left,
  right,
  variant = "default",
  ...props
}: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        data-variant={variant}
        className={cn(accordionTriggerVariants({ variant }), className)}
        {...props}
      >
        <div className="flex min-w-0 items-center gap-2">
          {left ?? children}

          <ChevronDownIcon
            data-slot="accordion-trigger-icon"
            className="pointer-events-none size-4 shrink-0 text-muted-foreground group-aria-expanded/accordion-trigger:hidden"
          />

          <ChevronUpIcon
            data-slot="accordion-trigger-icon"
            className="pointer-events-none hidden size-4 shrink-0 text-muted-foreground group-aria-expanded/accordion-trigger:inline"
          />
        </div>

        {right && <div className="ml-auto flex shrink-0 items-center gap-3">{right}</div>}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...props}
    >
      <div
        className={cn(
          "h-(--accordion-panel-height) pt-0 pb-2.5 data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
