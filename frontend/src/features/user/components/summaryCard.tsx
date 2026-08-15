import { Heading } from "@/components/layout/heading";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

type SummaryCardProps = {
  title: string;
  children: React.ReactNode;
};

export default function SummaryCard({ title, children }: SummaryCardProps) {
  return (
    <Card className="w-[calc(100vw-4.5rem)] shrink-0 border bg-background sm:w-96">
      <CardContent>
        <Heading level={2} className="text-center uppercase">
          {title}
        </Heading>
      </CardContent>

      <CardFooter className="flex flex-row items-center justify-center gap-4 bg-background">
        {children}
      </CardFooter>
    </Card>
  );
}
