"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LockKeyhole, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { ChangePasswordForm } from "./change-password";

export function QuickActions({ userId }: { userId: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return (
    <>
      <Card className="bg-white rounded-lg border border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <ChangePasswordForm userId={userId}>
            <Button
              size="lg"
              className="w-full bg-azure hover:bg-blue-600 inline-flex gap-3 items-center justify-center"
            >
              <LockKeyhole className="text-white size-4" />
              <span className="text-white">Change Password</span>
            </Button>
          </ChangePasswordForm>
          <Button
            size="lg"
            className="w-full inline-flex gap-3 items-center justify-center bg-lipstick-red hover:bg-crimson-red"
            onClick={handleLogout}
          >
            <LogOut className="text-white size-4" />
            <span className="text-white">Sign out</span>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
