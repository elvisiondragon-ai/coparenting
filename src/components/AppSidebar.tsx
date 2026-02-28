import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Settings, CalendarDays, CalendarRange, DollarSign,
  Heart, ListTodo, BookOpen, Baby, Globe, LogIn, LogOut, User
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

const navItems = [
  { titleKey: "navigation.dashboard", url: "/", icon: LayoutDashboard },
  { titleKey: "navigation.setup", url: "/setup", icon: Settings },
  { titleKey: "navigation.recurring_schedule", url: "/schedule", icon: CalendarDays },
  { titleKey: "navigation.monthly_calendar", url: "/calendar", icon: CalendarRange },
  { titleKey: "navigation.expenses", url: "/expenses", icon: DollarSign },
  { titleKey: "navigation.child_support", url: "/child-support", icon: Heart },
  { titleKey: "navigation.tasks", url: "/tasks", icon: ListTodo },
  { titleKey: "navigation.notes", url: "/notes", icon: BookOpen },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { setup, is_pro } = useAppContext();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'id' ? 'en' : 'id');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <div className="px-4 pt-6 pb-4 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-2 h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                onClick={toggleLanguage}
                title={i18n.language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
              >
                <Globe className="h-4 w-4" />
                <span className="sr-only">Toggle language</span>
                <span className="absolute -bottom-3 text-[10px] font-bold">{i18n.language.toUpperCase()}</span>
              </Button>
              <div className="flex items-center gap-2 mb-1">
                <img src="/coparenting_icon.png" alt="Logo" className="h-8 w-8 object-contain" />
                <span className="font-display text-lg font-bold text-sidebar-foreground whitespace-nowrap">eL Vision</span>
              </div>
              <p className="text-xs text-sidebar-foreground/60">
                {setup.isConfigured
                  ? `${setup.parentAName} & ${setup.parentBName}`
                  : t('sidebar.coparenting_tracker')}
              </p>
            </div>
          )}
          <SidebarGroupLabel>{t('sidebar.navigation')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{t(item.titleKey)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {session ? (
          <div className="flex flex-col gap-2">
            {!collapsed && (
              <div className="flex items-center gap-2 mb-2 px-2">
                <div className="h-8 w-8 rounded-full bg-sidebar-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-sidebar-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-sidebar-foreground truncate">
                    {session.user.user_metadata?.display_name || session.user.email}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${is_pro ? 'text-primary' : 'text-muted-foreground'}`}>
                    {is_pro ? 'PRO Account' : 'FREE Account'}
                  </span>
                </div>
              </div>
            )}
            <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </div>
        ) : (
          <SidebarMenuButton onClick={() => navigate("/auth")} className="text-sidebar-primary hover:text-sidebar-primary hover:bg-sidebar-primary/10">
            <LogIn className="mr-2 h-4 w-4" />
            {!collapsed && <span>Login / Register</span>}
          </SidebarMenuButton>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
