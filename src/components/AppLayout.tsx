import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ReactNode } from "react";
import { Menu } from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 sm:h-16 flex items-center border-b bg-background px-3 sm:px-4 shrink-0 gap-3 sm:gap-4">
            <SidebarTrigger className="h-9 sm:h-10 w-auto px-3 sm:px-4 flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 border-none rounded-lg transition-all shadow-md">
              <Menu className="h-4 sm:h-5 w-4 sm:w-5" />
              <span className="font-bold text-xs sm:text-sm hidden xs:inline">MENU</span>
            </SidebarTrigger>
            <div className="flex-1"></div>
          </header>
          <main className="flex-1 overflow-x-hidden p-3 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
