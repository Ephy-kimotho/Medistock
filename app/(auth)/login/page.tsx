import { prisma } from "@/lib/prisma";
import { LoginForm } from "./LoginForm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Login() {
  // check if user count is greater than 0
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      redirect("/setup");
    }
  } catch (error) {
    console.error("Database connection failed: ", error);
    return (
      <div>
        <p>DB connection failed</p>
      </div>
    );
  }

  return <LoginForm />;
}
