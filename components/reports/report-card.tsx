"use client";

import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ReportCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  onGenerate: () => void;
}

export function ReportCard({
  title,
  description,
  icon: Icon,
  iconColor = "text-azure",
  iconBgColor = "bg-azure/10",
  onGenerate,
}: ReportCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div
            className={`size-10 rounded-lg ${iconBgColor} flex items-center justify-center shrink-0`}
          >
            <Icon className={`size-5 ${iconColor}`} />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-sm mt-1">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full bg-azure hover:bg-blue-600"
          onClick={onGenerate}
        >
          Generate Report
        </Button>
      </CardContent>
    </Card>
  );
}
