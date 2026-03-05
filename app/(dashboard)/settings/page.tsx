import { SettingsForm } from "@/components/settings/settings-form";

function SettingsPage() {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-slate-900 text-3xl font-bold capitalize">
          System settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage facility information and alert configurations.
        </p>
      </header>

      {/* Settings form goes here */}
      <SettingsForm />
    </section>
  );
}

export default SettingsPage;
