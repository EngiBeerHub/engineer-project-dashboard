"use client";

import { Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

type Project = {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  status: "active" | "done";
  memo?: string;
  parameters: {
    energy: number;
    trust: number;
    qol: number;
    skill: number;
    social: number;
  };
};

type ProjectCardProps = {
  project: Project;
  onComplete?: (id: string) => void;
  onEdit?: (id: string) => void;
};

export function ProjectCard({ project, onComplete, onEdit }: ProjectCardProps) {
  const isDone = project.status === "done";

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getParameterColor = (key: string) => {
    const colors: Record<string, string> = {
      energy: "text-orange-600 dark:text-orange-400",
      trust: "text-blue-600 dark:text-blue-400",
      qol: "text-green-600 dark:text-green-400",
      skill: "text-purple-600 dark:text-purple-400",
      social: "text-yellow-600 dark:text-yellow-500",
    };
    return colors[key] || "text-foreground";
  };

  const formatValue = (value: number) =>
    value > 0 ? `+${value}` : value.toString();

  return (
    <Card
      className={`relative p-5 transition-all duration-200 ${
        isDone ? "opacity-60" : "hover:-translate-y-1 hover:shadow-md"
      }`}
    >
      {/* Complete checkbox or checkmark */}
      <div className="absolute top-4 right-4">
        {isDone ? (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Check className="h-3 w-3 text-green-700 dark:text-green-300" />
          </div>
        ) : (
          <Checkbox
            checked={false}
            className="h-5 w-5"
            onCheckedChange={() => onComplete?.(project.id)}
          />
        )}
      </div>

      {/* Title */}
      <h3 className="mb-3 line-clamp-1 pr-8 font-medium text-base text-foreground">
        {project.title}
      </h3>

      {/* Period */}
      <div className="mb-4 text-muted-foreground text-sm">
        {formatDate(project.startDate)} 〜{" "}
        {project.endDate ? formatDate(project.endDate) : "進行中"}
      </div>

      {/* Memo */}
      {project.memo && (
        <p className="mb-4 line-clamp-2 text-muted-foreground text-sm">
          <span className="font-bold">メモ:</span> {project.memo}
        </p>
      )}

      {/* Parameters */}
      <div className="mb-4 flex flex-wrap gap-2 font-medium text-sm">
        <span className={getParameterColor("energy")}>
          E:{formatValue(project.parameters.energy)}
        </span>
        <span className="text-muted-foreground">/</span>
        <span className={getParameterColor("trust")}>
          C:{formatValue(project.parameters.trust)}
        </span>
        <span className="text-muted-foreground">/</span>
        <span className={getParameterColor("qol")}>
          Q:{formatValue(project.parameters.qol)}
        </span>
        <span className="text-muted-foreground">/</span>
        <span className={getParameterColor("skill")}>
          S:{formatValue(project.parameters.skill)}
        </span>
        <span className="text-muted-foreground">/</span>
        <span className={getParameterColor("social")}>
          So:{formatValue(project.parameters.social)}
        </span>
      </div>

      {/* Actions */}
      {!isDone && (
        <div className="flex gap-2">
          <Button
            className="gap-2 bg-transparent"
            onClick={() => onEdit?.(project.id)}
            size="sm"
            variant="outline"
          >
            <Pencil className="h-3 w-3" />
            編集
          </Button>
          <Button
            onClick={() => onComplete?.(project.id)}
            size="sm"
            variant="outline"
          >
            完了
          </Button>
        </div>
      )}
    </Card>
  );
}
