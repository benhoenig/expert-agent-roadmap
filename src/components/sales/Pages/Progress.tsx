
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SalesProgress() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Progress Tracking</h2>
          <p className="text-muted-foreground">Monitor your performance metrics</p>
        </div>
        <Button className="self-start">
          <TrendingUp className="mr-2 h-4 w-4" />
          View Reports
        </Button>
      </div>
    </div>
  );
}
