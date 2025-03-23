
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Auto-close sidebar on mobile when location changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);
  
  // Set sidebar closed by default on mobile
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 overflow-y-auto border-r border-border bg-card shadow-lg md:relative md:shadow-none",
              isMobile && "backdrop-blur-xl bg-background/80"
            )}
          >
            <Sidebar closeSidebar={() => setSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-x-hidden">
        {/* Header bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="mr-2"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </Button>
          
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 flex justify-center sm:justify-start ml-2"
          >
            <h1 className="text-lg font-medium tracking-tight text-gradient">
              Expert Agent Roadmap
            </h1>
          </motion.div>
          
          <div className="flex items-center gap-2">
            {/* Profile or notification elements could go here */}
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-x-hidden p-4 lg:p-8 transition-all">
          {/* Removed AnimatePresence here to prevent duplicate animations */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-7xl"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
