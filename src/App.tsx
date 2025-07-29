import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import DataSourceScreen from "./components/data/DataSourceScreen";
import ForecastSetupScreen from "./components/forecast/ForecastSetupScreen";
import Dashboard from "./pages/Dashboard";
import MarketTrendsScreen from "./components/market-trends/MarketTrendsScreen";
import { ForecastProvider } from "./context/ForecastContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

// Example user IDs - replace with actual Auth0 user IDs
const ADMIN_USER_IDS = [
  'auth0|688800626594333b2d3813ab', // karthik's user id
  'google-oauth2|108770588093688005437'  // team@featureboxai.com user id
];

const RESTRICTED_USER_IDS = [
];

// User restricted from forecasting features
const FORECASTING_RESTRICTED_USER_IDS = [
  'auth0|68884faae8ffc9f5c2dd2e92', // Sienna Wings
  //'auth0|688800626594333b2d3813ab', // karthik's user id
];

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
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/home" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/data-source" element={
              <ProtectedRoute restrictedUserIds={FORECASTING_RESTRICTED_USER_IDS}>
                <DataSourceScreen />
              </ProtectedRoute>
            } />
            <Route path="/forecast-setup" element={
              <ProtectedRoute restrictedUserIds={FORECASTING_RESTRICTED_USER_IDS}>
                <ForecastSetupScreen />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute allowedUserIds={ADMIN_USER_IDS}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/market-trends" element={
              <ProtectedRoute restrictedUserIds={RESTRICTED_USER_IDS}>
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
