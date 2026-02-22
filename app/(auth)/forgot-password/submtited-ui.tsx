import { CheckCircle } from "lucide-react";

function SubmittedUI({ email }: { email: string }) {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-8 border border-border">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center size-16 bg-green-500/10 rounded-full">
            <CheckCircle className="size-8 text-green-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-semibold  text-green-500 text-center mb-2">
          Check your email
        </h1>
        <p className="text-base text-muted-foreground text-center mb-6">
          We&apos;ve sent a password reset link to{" "}
          <span className="font-medium text-foreground">{email}</span>
          &nbsp; if it exists.
        </p>
      </div>
    </div>
  );
}

export default SubmittedUI;
