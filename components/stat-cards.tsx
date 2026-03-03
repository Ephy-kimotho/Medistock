import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StatCardProps } from "@/lib/types";

function Statcards({ stats }: { stats: StatCardProps[] }) {
  return (
    <div className="my-3 md:my-5 grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ title, metric, details, theme, Icon }, idx) => (
        <Card
          key={idx}
          className="border border-mist/60 shadow-sm rounded-lg"
        >
          <CardHeader>
            <CardTitle className="text-base font-semibold text-accent-foreground/80 capitalize">
              {title}
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-0 space-y-3">
            <div className="flex items-center justify-between">
              <p
                className={cn(
                  "text-2xl md:text-3xl font-bold",
                  theme === "green" && "text-medium-jungle",
                  theme === "blue" && "text-azure",
                  theme === "orange" && "text-princeton-orange",
                  theme === "red" && "text-lipstick-red",
                  theme === "purple" && "text-purple-600",
                )}
              >
                {metric}
              </p>

              <div
                className={cn(
                  "size-12 grid place-items-center rounded-md",
                  theme === "green" && "bg-medium-jungle/20",
                  theme === "blue" && "bg-azure/20",
                  theme === "orange" && "bg-princeton-orange/20",
                  theme === "red" && "bg-lipstick-red/20",
                  theme === "purple" && "bg-purple-600/20",
                )}
              >
                <Icon
                  className={cn(
                    "size-6",
                    theme === "green" && "text-medium-jungle",
                    theme === "blue" && "text-azure",
                    theme === "orange" && "text-princeton-orange",
                    theme === "red" && "text-lipstick-red",
                    theme === "purple" && "text-purple-600",
                  )}
                />
              </div>
            </div>

            {details && (
              <p className="text-xs text-muted-foreground">
                {details}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { Statcards };
