
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "./components/auth/AuthPage";
import { DashboardLayout } from "./components/dashboard/Layout";
import { UserDashboard } from "./components/dashboard/Pages/User";
import { MasterData } from "./components/dashboard/Pages/MasterData";
import { Content } from "./components/dashboard/Pages/Content";
import { SalesLayout } from "./components/sales/SalesLayout";
import { SalesRoadmap } from "./components/sales/Pages/Roadmap";
import { SalesProgress } from "./components/sales/Pages/Progress";
import { SalesRanking } from "./components/sales/Pages/Ranking";
import { SalesInformation } from "./components/sales/Pages/Information";
import { SalesSettings } from "./components/sales/Pages/Settings";
import { MentorLayout } from "./components/mentor/MentorLayout";
import { MentorMySales } from "./components/mentor/Pages/MySales";
import { MentorGoals } from "./components/mentor/Pages/Goals";
import { MentorAllSales } from "./components/mentor/Pages/AllSales";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" theme="light" closeButton className="z-[100]" />
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route path="/" element={<AuthPage />} />
          
          {/* Dashboard routes - Admin */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<UserDashboard />} />
            <Route path="master-data" element={<MasterData />} />
            <Route path="content" element={<Content />} />
          </Route>
          
          {/* Sales routes */}
          <Route path="/sales" element={<SalesLayout />}>
            <Route index element={<SalesRoadmap />} />
            <Route path="progress" element={<SalesProgress />} />
            <Route path="ranking" element={<SalesRanking />} />
            <Route path="information" element={<SalesInformation />} />
            <Route path="settings" element={<SalesSettings />} />
          </Route>
          
          {/* Mentor routes */}
          <Route path="/mentor" element={<MentorLayout />}>
            <Route index element={<MentorMySales />} />
            <Route path="goals" element={<MentorGoals />} />
            <Route path="all-sales" element={<MentorAllSales />} />
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
