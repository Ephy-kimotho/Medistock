import { Card, CardContent } from "@/components/ui/card";
import { Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ExpiredTokenUI() {
  return (
    <Card className="w-full max-w-md border-0 shadow-lg rounded-2xl">
      <CardContent className="pt-8 pb-8 px-8">
        <div className="text-center space-y-6">
          {/* Expired Icon */}
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="size-8 text-amber-600" />
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              Invitation Expired
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              This invitation link has expired. Please contact your
              administrator to request a new invitation.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left">
            <p className="text-sm text-slate-600">
              Invitations are valid for 7 days due to security reasons. Ask your
              admin to resend you a new invitation link.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-center items-center gap-3 pt-2">
            <Button asChild size="sm" className="w-full">
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
