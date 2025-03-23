
import { NavLink, useNavigate } from "react-router-dom";
import { User, Database, FileText, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  closeSidebar: () => void;
}

export function Sidebar({ closeSidebar }: SidebarProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/");
  };
  
  const sidebarItems = [
    {
      title: "User",
      icon: User,
      path: "/dashboard",
      description: "User dashboard and profile"
    },
    {
      title: "Master Data",
      icon: Database,
      path: "/dashboard/master-data",
      description: "Manage master data records"
    },
    {
      title: "Content",
      icon: FileText,
      path: "/dashboard/content",
      description: "Manage content and resources"
    }
  ];
  
  return (
    <div className="flex flex-col h-full py-4 overflow-y-auto">
      <div className="px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">EA</span>
          </div>
          <span className="font-medium text-sm">Expert Agent</span>
        </div>
        
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={closeSidebar} className="lg:hidden">
            <X size={18} />
          </Button>
        )}
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {sidebarItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                  "hover:bg-gold-50 hover:text-gold-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500",
                  isActive 
                    ? "bg-gold-100 text-gold-900 font-medium" 
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </NavLink>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="mt-auto px-3">
        <Separator className="my-4" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
