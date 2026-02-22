import { prisma } from "@/lib/prisma";
import { LoginForm } from "./LoginForm";
import { redirect } from "next/navigation";

export default async function Login() {
  // check if user count is greater than 0
  const userCount = await prisma.user.count();

  if (userCount === 0) {
    redirect("/setup");
  }

  return <LoginForm />;
}
