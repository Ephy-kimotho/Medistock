import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function InvalidTokenUI({ message }: { message: string }) {
  return (
    <Card className="w-full max-w-md border-0 shadow-lg rounded-2xl">
      <CardContent className="pt-8 pb-8 px-8">
        <div className="text-center space-y-6">
          {/* Error Icon */}
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="size-8 text-red-600" />
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              Invalid Invitation
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">{message}</p>
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
