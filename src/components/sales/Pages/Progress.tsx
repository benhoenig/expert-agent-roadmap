import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { CircularProgress } from "@/components/ui/circular-progress";

export function SalesProgress() {
  const [progressPercentage, setProgressPercentage] = useState(75); // Example progress value
  const [probationPercentage, setProbationPercentage] = useState(60); // Example probation value

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Progress Tracking</h2>
          <p className="text-muted-foreground">Monitor your performance metrics</p>
        </div>
      </div>
      
      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress" className="mt-6">
          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-6">Weekly Progress</h3>
            
            <CircularProgress 
              progressPercentage={progressPercentage}
              probationPercentage={probationPercentage}
              size="md"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="stats" className="mt-6">
          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4">Performance Statistics</h3>
            <p>Your detailed statistics will appear here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="logs" className="mt-6">
          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4">Activity Logs</h3>
            <p>Your recent activity logs will appear here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
