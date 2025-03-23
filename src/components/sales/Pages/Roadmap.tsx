
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export function SalesRoadmap() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sales Roadmap</h2>
          <p className="text-muted-foreground">Strategic plan for your sales journey</p>
        </div>
        <Button className="self-start">
          <MapPin className="mr-2 h-4 w-4" />
          Create New Milestone
        </Button>
      </div>
    </div>
  );
}
