import { useState } from "react";

export function SalesProgress() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Progress Tracking - TEST VERSION</h2>
          <p className="text-muted-foreground">This is a test to see if this component is being rendered</p>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Test Button</button>
      </div>
    </div>
  );
}
