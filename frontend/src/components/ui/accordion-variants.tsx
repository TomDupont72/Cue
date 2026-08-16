import { cva } from "class-variance-authority";

export const accordionTriggerVariants = cva(
  "group/accordion-trigger relative flex flex-1 items-center text-left text-sm font-medium transition-all outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring aria-disabled:pointer-events-none aria-disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "rounded-lg border border-transparent py-2.5 hover:underline",
        card: "cursor-pointer rounded-xl bg-card px-4 py-4 pr-16 hover:no-underline"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
