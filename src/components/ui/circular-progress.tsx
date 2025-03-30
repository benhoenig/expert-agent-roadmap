import { cn } from "@/lib/utils";

interface CircularProgressProps {
  progressPercentage: number;
  probationPercentage: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function CircularProgress({
  progressPercentage,
  probationPercentage,
  className,
  size = "md"
}: CircularProgressProps) {
  // Size mapping
  const sizeMap = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("relative", sizeMap[size])}>
        {/* Outer ring - Progress */}
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="transparent" 
            stroke="#e6e6e6" 
            strokeWidth="8" 
          />
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="transparent" 
            stroke="#10b981" // Green color for progress
            strokeWidth="8" 
            strokeDasharray={`${2 * Math.PI * 45 * progressPercentage / 100} ${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
            strokeDashoffset={2 * Math.PI * 45 * 0.25} // Start from top
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          
          {/* Inner ring - Probation */}
          <circle 
            cx="50" 
            cy="50" 
            r="35" 
            fill="transparent" 
            stroke="#e6e6e6" 
            strokeWidth="8" 
          />
          <circle 
            cx="50" 
            cy="50" 
            r="35" 
            fill="transparent" 
            stroke="hsl(var(--primary))" // Primary app color
            strokeWidth="8" 
            strokeDasharray={`${2 * Math.PI * 35 * probationPercentage / 100} ${2 * Math.PI * 35 * (1 - probationPercentage / 100)}`}
            strokeDashoffset={2 * Math.PI * 35 * 0.25} // Start from top
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          
          {/* Percentage text in the middle */}
          <text 
            x="50" 
            y="50" 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fontSize="16" 
            fontWeight="bold"
          >
            {progressPercentage}%
          </text>
        </svg>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm">Progress</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
          <span className="text-sm">Probation</span>
        </div>
      </div>
    </div>
  );
} 