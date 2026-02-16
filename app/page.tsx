import { ComponentExample } from "@/components/component-example";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <ComponentExample />
      <Button asChild>
        <Link href="/dashboard">Go to dashboard</Link>
      </Button>
    </>
  );
}
