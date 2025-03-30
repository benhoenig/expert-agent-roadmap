import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CalendarDays } from "lucide-react";

export interface MonthData {
  month: string;
  content: React.ReactNode;
}

interface MonthlyAccordionProps {
  months: MonthData[];
  className?: string;
}

export function MonthlyAccordion({ months, className }: MonthlyAccordionProps) {
  return (
    <div className={className}>
      <Accordion type="single" collapsible className="w-full">
        {months.map((month, index) => (
          <AccordionItem key={index} value={`month-${index}`} className="border-b-0 last:border-0">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{month.month}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              {month.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
} 