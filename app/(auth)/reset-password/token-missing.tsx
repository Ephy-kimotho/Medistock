import { Card, CardContent } from "@/components/ui/card";
import { CircleAlert } from "lucide-react";

export function TokenMissing() {
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
            <h2 className="text-xl font-bold text-slate-900">Token Missing</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              A reset token is needed to reset your password.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
