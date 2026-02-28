import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import SetupPage from "./pages/SetupPage";
import SchedulePage from "./pages/SchedulePage";
import CalendarPage from "./pages/CalendarPage";
import ExpensesPage from "./pages/ExpensesPage";
import ChildSupportPage from "./pages/ChildSupportPage";
import TasksPage from "./pages/TasksPage";
import NotesPage from "./pages/NotesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/setup" element={<SetupPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/child-support" element={<ChildSupportPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
