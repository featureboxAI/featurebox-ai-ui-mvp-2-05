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

// Admin users - Access all features
const ADMIN_USER_IDS = [
  'auth0|687f02eafb6744d5fe3c9f8a', // team@featureboxai.com - Admin
  'auth0|687f0e3dfb6744d5fe3ca0f6', // 1994ssmalla@gmail.com - Admin
];

// Users with access to Market Trends + Demand Forecasting
const FORECASTING_ACCESS_USER_IDS = [
  'auth0|688e5737480c85818cab73ba', // kvalluri@berkeley.edu - Ladera Dummy
  'auth0|68885310e8ffc9f5c2dd2f14', // tetrud@berkeley.edu - Actual Ladera
  'auth0|687f0be2fb6744d5fe3ca09f', // malla95.supraja@gmail.com - Herb Farms Dummy
  'auth0|688849466594333b2d382039', // sjames@herb-pharm.com - Actual Herb Farms
];

// Users restricted from forecasting features (Market Trends Only)
const FORECASTING_RESTRICTED_USER_IDS = [
  'auth0|688800626594333b2d3813ab', // karthikv722@gmail.com - Sienna Wings Dummy
  'auth0|68884faae8ffc9f5c2dd2e92', // ceo@siennasauceco.com - Actual Sienna Wings
];

// Users with no restrictions (can access Market Trends)
const RESTRICTED_USER_IDS = [
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ForecastProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
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
              <ProtectedRoute 
                allowedUserIds={[...ADMIN_USER_IDS, ...FORECASTING_ACCESS_USER_IDS]}
                restrictedUserIds={FORECASTING_RESTRICTED_USER_IDS}
              >
                <DataSourceScreen />
              </ProtectedRoute>
            } />
            <Route path="/forecast-results" element={
              <ProtectedRoute 
                allowedUserIds={[...ADMIN_USER_IDS, ...FORECASTING_ACCESS_USER_IDS]}
                restrictedUserIds={FORECASTING_RESTRICTED_USER_IDS}
              >
                <ForecastSetupScreen />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute allowedUserIds={ADMIN_USER_IDS}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/market-trends" element={
              <ProtectedRoute 
                allowedUserIds={[...ADMIN_USER_IDS, ...FORECASTING_ACCESS_USER_IDS, ...FORECASTING_RESTRICTED_USER_IDS]}
              >
                <MarketTrendsScreen />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </ForecastProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
