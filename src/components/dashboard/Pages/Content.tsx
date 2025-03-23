
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function Content() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">
            Create and manage your content resources.
          </p>
        </div>
      </motion.div>

      <Card className="border border-border/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
          <CardDescription>
            This section will be expanded based on future requirements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border bg-muted/40 p-10 text-center">
            <h3 className="text-lg font-medium">No content available</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Content management functionality will be added in future updates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
