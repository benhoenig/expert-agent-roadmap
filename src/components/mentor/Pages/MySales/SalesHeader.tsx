import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SalesUser } from "./types";
import { formatDate, getInitials, getProbationStatusColor } from "./utils";

interface SalesHeaderProps {
  sales: SalesUser;
}

export function SalesHeader({ sales }: SalesHeaderProps) {
  const salesUser = sales._user[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <h4 className="text-sm font-medium text-muted-foreground">Starting Date</h4>
        <p>{formatDate(sales.starting_date)}</p>
      </div>
      <div>
        <h4 className="text-sm font-medium text-muted-foreground">Property Type</h4>
        <p>{sales.property_type || "N/A"}</p>
      </div>
      <div>
        <h4 className="text-sm font-medium text-muted-foreground">Probation</h4>
        <div className="flex items-center gap-2">
          <span>{sales.probation_status}</span>
          {sales.probation_extended && (
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              Extended
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
} 