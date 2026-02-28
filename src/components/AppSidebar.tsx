import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Settings, CalendarDays, CalendarRange, DollarSign,
  Heart, ListTodo, BookOpen, Baby,
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Setup", url: "/setup", icon: Settings },
  { title: "Recurring Schedule", url: "/schedule", icon: CalendarDays },
  { title: "Monthly Calendar", url: "/calendar", icon: CalendarRange },
  { title: "Expenses", url: "/expenses", icon: DollarSign },
  { title: "Child Support", url: "/child-support", icon: Heart },
  { title: "Tasks", url: "/tasks", icon: ListTodo },
  { title: "Notes", url: "/notes", icon: BookOpen },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { setup } = useAppContext();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <div className="px-4 pt-6 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Baby className="h-5 w-5 text-sidebar-primary" />
                <span className="font-display text-lg font-bold text-sidebar-foreground">CoParent</span>
              </div>
              <p className="text-xs text-sidebar-foreground/60">
                {setup.isConfigured
                  ? `${setup.parentAName} & ${setup.parentBName}`
                  : "Co-Parenting Tracker"}
              </p>
            </div>
          )}
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
