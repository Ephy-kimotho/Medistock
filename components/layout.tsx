import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
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

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Header */}
          <header className="bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 flex h-16 pt-2 shrink-0 items-center justify-between border-b shadow-sm  px-4">
            {/* Left side - Hamburger menu icon */}
            <div className="flex items-center gap-2">
              <SidebarTrigger className="cursor-pointer" />

              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
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
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline-flex">John Doe</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="pl-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">John Doe</p>
                      <p className="text-xs text-muted-foreground">
                        john@clinic.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="pl-4">Profile</DropdownMenuItem>
                  <DropdownMenuItem className="pl-4">Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 pl-4">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

export { Layout };
