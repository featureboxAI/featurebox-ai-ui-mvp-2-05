import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import DataSourceScreen from "./components/data/DataSourceScreen";
import ForecastSetupScreen from "./components/forecast/ForecastSetupScreen";
import Dashboard from "./pages/Dashboard";
import MarketTrendsScreen from "./components/market-trends/MarketTrendsScreen";
import { ForecastProvider } from "./context/ForecastContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ForecastProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/data-source" element={
              <ProtectedRoute>
                <DataSourceScreen />
              </ProtectedRoute>
            } />
            <Route path="/forecast-setup" element={
              <ProtectedRoute>
                <ForecastSetupScreen />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/market-trends" element={
              <ProtectedRoute>
                <MarketTrendsScreen />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ForecastProvider>
  </QueryClientProvider>
);

export default App;
