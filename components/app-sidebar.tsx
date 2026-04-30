"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Hospital,
  House,
  Box,
  ArrowLeftRight,
  Bell,
  FileText,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Pill,
  Layers,
  Trash2,
  SquarePen,
  Mail,
  UserPlus,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchSettings } from "@/hooks/useSettings";
import Link from "next/link";
import { AlertBadge } from "@/components/alerts/alerts-badge";

// Navigation items configuration
const mainNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: House,
  },
  {
    title: "Drug Category",
    url: "/inventory/categories",
    subMenuLabel: "All Categories",
    icon: Layers,
    subItems: [
      { title: "Medicines", url: "/inventory/medicines", icon: Pill },
      { title: "Stock Inventory", url: "/inventory", icon: Box },
    ],
  },
  {
    title: "Transactions",
    url: "/transactions",
    subMenuLabel: "Transaction History",
    icon: ArrowLeftRight,
    subItems: [
      { title: "Dispense", url: "/transactions/dispense", icon: SquarePen },
      { title: "Wastage", url: "/transactions/wastage", icon: Trash2 },
    ],
  },
  {
    title: "Alerts",
    url: "/alerts",
    icon: Bell,
    badge: true,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
  },
  {
    title: "Onboarding",
    url: "/onboarding",
    icon: UserPlus,
  },
  {
    title: "Invitations",
    url: "/invitations",
    icon: Mail,
  },
];

const footerNavItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    canViewUsers,
    canViewAlerts,
    canViewReports,
    canManageInvitations,
    canManageSettings,
    isAuditor,
    isHR,
  } = usePermissions();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Check if a path is active
  const isActive = (url: string) => {
    // Exact match
    if (pathname === url) return true;

    // Special handling for /transactions - match detail pages but not known sub-routes
    if (url === "/transactions" && pathname.startsWith("/transactions/")) {
      const subPath = pathname.slice("/transactions/".length);
      const knownSubRoutes = ["dispense", "wastage", "pending-payments"];
      if (!knownSubRoutes.some((route) => subPath.startsWith(route))) {
        return true;
      }
      return false;
    }

    // Exclude /inventory as it's a leaf route
    if (pathname.startsWith(url + "/") && url !== "/inventory") {
      return true;
    }

    return false;
  };

  // Check if the parent or any subitem is active (for collapsible default open state)
  const isSubItemActive = (item: {
    url?: string;
    subItems?: { url: string }[];
  }) => {
    if (item.url && pathname === item.url) return true;
    return item.subItems?.some((sub) => pathname === sub.url) ?? false;
  };

  // Check visibility for each nav item
  const isNavItemVisible = (title: string) => {
    switch (title) {
      case "Users":
        return canViewUsers;
      case "Alerts":
        return canViewAlerts;
      case "Reports":
        return canViewReports;
      case "Invitations":
        return canManageInvitations;
      case "Onboarding":
        return canManageInvitations;
      case "Dashboard":
        return !isAuditor;
      default:
        return true;
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-transparent active:bg-transparent"
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Hospital className="size-5" />
              </div>
              <span className="text-lg font-semibold text-sidebar-primary-foreground">
                MediStock
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation Area */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="mt-4">
            <SidebarMenu className="gap-3">
              {mainNavItems.map((item) =>
                item.subItems ? (
                  // Collapsible menu item with main link
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={isSubItemActive(item)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          className={cn(
                            "text-sidebar-primary-foreground hover:bg-sidebar-accent cursor-pointer",
                          )}
                        >
                          <item.icon className="size-4" />
                          <span className="text-base">{item.title}</span>
                          <ChevronDown className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {/* Main link at the top */}
                          {item.url && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive(item.url)}
                              >
                                <Link
                                  href={item.url}
                                  className="text-sidebar-primary-foreground"
                                >
                                  <item.icon className="text-sidebar-primary-foreground size-4" />
                                  <span>{item.subMenuLabel || item.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}
                          {/* Sub-items */}
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem
                              key={subItem.title}
                              className={cn(
                                (subItem.title === "Dispense" ||
                                  subItem.title === "Wastage") &&
                                  isHR &&
                                  "hidden",
                                subItem.title === "Pending Payments" &&
                                  (isHR || isAuditor) &&
                                  "hidden",
                              )}
                            >
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive(subItem.url)}
                              >
                                <Link
                                  href={subItem.url}
                                  className="text-sidebar-primary-foreground"
                                >
                                  <subItem.icon className="size-4 text-sidebar-primary-foreground" />
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem
                    key={item.title}
                    className={cn(!isNavItemVisible(item.title) && "hidden")}
                  >
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive(item.url)}
                      className="text-sidebar-primary-foreground hover:bg-sidebar-accent"
                    >
                      <Link
                        href={item.url}
                        className="text-sidebar-primary-foreground"
                      >
                        <item.icon className="size-4" />
                        <span className="text-base">{item.title}</span>
                        {item.badge && <AlertBadge />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Navigation */}
      <SidebarFooter className="border-t border-sidebar-border py-4">
        <SidebarMenu className="gap-2">
          {/* Settings - Admin only */}
          {canManageSettings &&
            footerNavItems.map((item) => (
              <SidebarMenuItem
                key={item.title}
                onMouseEnter={() => prefetchSettings(queryClient)}
                onFocus={() => prefetchSettings(queryClient)}
              >
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive(item.url)}
                  className="text-sidebar-primary-foreground hover:bg-sidebar-accent"
                >
                  <Link href={item.url}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}

          {/* Sign Out Button - Always visible */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              className="text-red-500 hover:bg-red-200 cursor-pointer hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export { AppSidebar };
