import { Card, CardContent } from "@/components/ui/card";
import { CircleAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function NoTokenUI() {
  return (
    <Card className="w-full max-w-md border-0 shadow-lg rounded-2xl">
      <CardContent className="pt-8 pb-8 px-8">
        <div className="text-center space-y-6">
          {/* Error Icon */}
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <CircleAlert className="size-8 text-red-600" />
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              Invitation Token Required
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              This page requires a valid invitation token to access. Please use
              the complete link from your invitation email.
            </p>
          </div>

          {/* Help Section */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
            <h3 className="text-sm font-semibold text-amber-800 mb-2">
              How to fix this:
            </h3>
            <ul className="text-sm text-amber-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                Check your email for the invitation link
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                Make sure you copied the entire URL
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                Contact your administrator for a new invitation
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-center items-center gap-3 pt-2">
            <Button asChild size="sm" className="w-2/3">
              <Link href="/login">
                <ArrowLeft className="size-4 mr-2" />
                Back to Login
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
