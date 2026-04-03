"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { cn, formatRole } from "@/lib/utils";
import { AppSkeleton } from "./app-skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchSettings } from "@/hooks/useSettings";
import Link from "next/link";

function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, isSessionPending, isAdmin, isInventoryManager } =
    usePermissions();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (isSessionPending && !currentUser) {
    return <AppSkeleton />;
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col min-h-screen overflow-hidden">
          {/* Header */}
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-6">
            {/* Left side - Hamburger menu icon */}
            <div className="flex items-center gap-2">
              <SidebarTrigger className="cursor-pointer" />
            </div>

            {/* Right side - Notifications & User */}
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-transparent"
              >
                <Bell className="size-5" />
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                  3
                </span>
              </Button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hover:bg-transparent data-[state=open]:bg-transparent hover:cursor-pointer flex items-center gap-2"
                  >
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {currentUser?.name
                          .split(" ")[0]
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col itme-center">
                      <span className="hidden md:inline-flex">
                        {currentUser?.name || "John Doe"}
                      </span>
                      <span className="hidden md:inline-flex text-xs  text-muted-foreground capitalize">
                        {currentUser?.role || "pharmacist"}
                      </span>
                    </div>
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="pl-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {" "}
                        {currentUser?.name || "John Doe"}
                      </p>
                      <p className={cn("text-xs text-muted-foreground")}>
                        {formatRole(currentUser?.role || "user")}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="pl-4 cursor-pointer" asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="size-4 text-muted-foreground" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {(isAdmin || isInventoryManager) && (
                    <DropdownMenuItem
                      className="pl-4 cursor-pointer"
                      asChild
                      onMouseEnter={() => prefetchSettings(queryClient)}
                      onFocus={() => prefetchSettings(queryClient)}
                    >
                      <Link
                        href="/settings"
                        className="flex items-center gap-2"
                      >
                        <Settings className="size-4 text-muted-foreground" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="hover:bg-blue-500 flex items-center gap-2 cursor-pointer text-red-600 pl-4"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-4 text-red-600" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto py-4 px-4 md:px-6">
            <section className="flex-1 flex flex-col min-h-full">
              {children}
            </section>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

export { Layout };
