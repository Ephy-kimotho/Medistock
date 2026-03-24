"use client";

import { format, getHours } from "date-fns";

interface GreetingProps {
  name: string;
}

export function Greeting({ name }: GreetingProps) {
  const now = new Date();
  const hour = getHours(now);

  const getGreeting = () => {
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formattedDate = format(now, "EEEE MMMM d, yyyy");

  return (
    <header className="mb-4">
      <h1 className="text-2xl font-bold text-slate-900 capitalize">
        {getGreeting()} {name}
      </h1>
      <p className="text-muted-foreground">{formattedDate}</p>
    </header>
  );
}
