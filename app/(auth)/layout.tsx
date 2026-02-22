import { ReactNode } from "react";
import { Hospital } from "lucide-react";

function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen flex flex-col bg-platinum">
      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-6">
        {/* Logo & Brand */}
        <header className="flex items-center gap-3 mb-6">
          <div className="size-14  rounded-lg bg-azure grid place-items-center shadow-md">
            <Hospital className="text-white size-7 lg:size-8" />
          </div>
          <h1 className="text-slate-900 font-bold text-2xl md:text-3xl tracking-tight">
            MediStock
          </h1>
        </header>

        {/* Authentication pages */}
        {children}
      </div>

      {/* Footer - Always at bottom */}
      <footer className="w-full py-4 text-center">
        <p className="text-xs md:text-sm text-slate-500">
          MediStock &copy; {new Date().getFullYear()} &middot; Pharmaceutical
          Inventory Management
        </p>
      </footer>
    </section>
  );
}

export default AuthLayout;
