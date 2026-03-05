import { Card, CardContent } from "@/components/ui/card";
import { UserX } from "lucide-react";

export function UserNotFoundUI() {
  return (
    <section className="space-y-4 grid place-items-center">
      <Card className="w-full max-w-md border-0 shadow-lg rounded-2xl">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <UserX className="size-8 text-amber-600" />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">
                User Not Found
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                The requested user profile could not be found. The account may
                have been deleted or doesn&apos;t exist.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
