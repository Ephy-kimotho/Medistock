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
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchSettings } from "@/hooks/useSettings";
import Link from "next/link";

// Navigation items configuration
const mainNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: House,
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: Box,
    subItems: [
      { title: "Categories", url: "/inventory/categories", icon: Layers },
      { title: "Medicines", url: "/inventory/medicines", icon: Pill },
    ],
  },
  {
    title: "Transactions",
    url: "/transactions",
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
    badge: 3,
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

  const { isAdmin, isInventoryManager, isUser } = usePermissions();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Check if a path is active
  const isActive = (url: string) => pathname === url;

  // Check if the parent or any subitem is active (for collapsible default open state)
  const isSubItemActive = (item: {
    url?: string;
    subItems?: { url: string }[];
  }) => {
    if (item.url && pathname === item.url) return true;
    return item.subItems?.some((sub) => pathname === sub.url) ?? false;
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
                            "text-sidebar-primary-foreground hover:bg-sidebar-accent",
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
                                  <span>
                                    {item.title === "Inventory"
                                      ? "Stock Inventory"
                                      : "Transaction History"}
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}
                          {/* Sub-items */}
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
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
                    className={cn(
                      item.title === "Users" && !isAdmin && "hidden",
                      item.title === "Alerts" &&
                        !(isAdmin || isInventoryManager) &&
                        "hidden",
                      item.title === "Reports" && isUser && "hidden",
                    )}
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
                        {item.badge && (
                          <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                            {item.badge}
                          </span>
                        )}
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
        <SidebarMenu
          className={cn("gap-2", !isAdmin && "hidden")}
          onMouseEnter={() => prefetchSettings(queryClient)}
          onFocus={() => prefetchSettings(queryClient)}
        >
          {footerNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
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

          {/* Sign Out Button */}
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
