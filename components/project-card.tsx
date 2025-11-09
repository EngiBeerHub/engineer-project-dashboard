"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Pencil, Check } from "lucide-react"
import { useState } from "react"

type Project = {
  id: string
  title: string
  startDate: string
  endDate?: string
  status: "active" | "done"
  memo?: string
  parameters: {
    energy: number
    trust: number
    qol: number
    skill: number
    social: number
  }
}

type ProjectCardProps = {
  project: Project
  onComplete?: (id: string) => void
  onEdit?: (id: string) => void
}

export function ProjectCard({ project, onComplete, onEdit }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isDone = project.status === "done"

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getParameterColor = (key: string) => {
    const colors: Record<string, string> = {
      energy: "text-orange-600 dark:text-orange-400",
      trust: "text-blue-600 dark:text-blue-400",
      qol: "text-green-600 dark:text-green-400",
      skill: "text-purple-600 dark:text-purple-400",
      social: "text-yellow-600 dark:text-yellow-500",
    }
    return colors[key] || "text-foreground"
  }

  const formatValue = (value: number) => {
    return value > 0 ? `+${value}` : value.toString()
  }

  return (
    <Card
      className={`relative p-5 transition-all duration-200 ${
        isDone ? "opacity-60" : "hover:shadow-md hover:-translate-y-1"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Complete checkbox or checkmark */}
      <div className="absolute right-4 top-4">
        {isDone ? (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Check className="h-3 w-3 text-green-700 dark:text-green-300" />
          </div>
        ) : (
          <Checkbox checked={false} onCheckedChange={() => onComplete?.(project.id)} className="h-5 w-5" />
        )}
      </div>

      {/* Title */}
      <h3 className="mb-3 pr-8 text-base font-medium text-foreground line-clamp-1">{project.title}</h3>

      {/* Period */}
      <div className="mb-4 text-sm text-muted-foreground">
        {formatDate(project.startDate)} 〜 {project.endDate ? formatDate(project.endDate) : "進行中"}
      </div>

      {/* Memo */}
      {project.memo && (
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
          <span className="font-bold">メモ:</span> {project.memo}
        </p>
      )}

      {/* Parameters */}
      <div className="mb-4 flex flex-wrap gap-2 text-sm font-medium">
        <span className={getParameterColor("energy")}>E:{formatValue(project.parameters.energy)}</span>
        <span className="text-muted-foreground">/</span>
        <span className={getParameterColor("trust")}>C:{formatValue(project.parameters.trust)}</span>
        <span className="text-muted-foreground">/</span>
        <span className={getParameterColor("qol")}>Q:{formatValue(project.parameters.qol)}</span>
        <span className="text-muted-foreground">/</span>
        <span className={getParameterColor("skill")}>S:{formatValue(project.parameters.skill)}</span>
        <span className="text-muted-foreground">/</span>
        <span className={getParameterColor("social")}>So:{formatValue(project.parameters.social)}</span>
      </div>

      {/* Actions */}
      {!isDone && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={() => onEdit?.(project.id)}>
            <Pencil className="h-3 w-3" />
            編集
          </Button>
          <Button variant="outline" size="sm" onClick={() => onComplete?.(project.id)}>
            完了
          </Button>
        </div>
      )}
    </Card>
  )
}
