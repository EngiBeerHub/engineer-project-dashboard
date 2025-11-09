"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, ChevronDown, ChevronRight, Check, X } from "lucide-react"
import { RadarChart } from "@/components/radar-chart"
import { ProjectCard } from "@/components/project-card"
import { ProjectModal, CompleteModal } from "@/components/project-modal"

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

const sampleProjects: Project[] = [
  {
    id: "1",
    title: "ダッシュボードUIリニューアル",
    startDate: "2025-01-15",
    status: "active",
    parameters: {
      energy: 2,
      trust: 1,
      qol: 1,
      skill: 3,
      social: 1,
    },
  },
  {
    id: "2",
    title: "APIパフォーマンス最適化",
    startDate: "2025-01-10",
    status: "active",
    parameters: {
      energy: -1,
      trust: 2,
      qol: -2,
      skill: 2,
      social: 0,
    },
  },
  {
    id: "3",
    title: "チーム勉強会の企画・運営",
    startDate: "2024-12-20",
    status: "active",
    parameters: {
      energy: 1,
      trust: 2,
      qol: 2,
      skill: 1,
      social: 3,
    },
  },
  {
    id: "4",
    title: "レガシーコードのリファクタリング",
    startDate: "2024-11-01",
    endDate: "2024-12-28",
    status: "done",
    parameters: {
      energy: -2,
      trust: 1,
      qol: -1,
      skill: 2,
      social: 1,
    },
  },
]

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>(sampleProjects)
  const [mode, setMode] = useState<"current" | "done" | "virtual">("current")
  const [isDoneExpanded, setIsDoneExpanded] = useState(false)
  const [toast, setToast] = useState<{ message: string; projectId: string } | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editModalData, setEditModalData] = useState<{
    isOpen: boolean
    project: Project | null
  }>({ isOpen: false, project: null })
  const [completeModalData, setCompleteModalData] = useState<{
    isOpen: boolean
    project: Project | null
  }>({ isOpen: false, project: null })

  const activeProjects = projects.filter((p) => p.status === "active")
  const doneProjects = projects.filter((p) => p.status === "done")

  const displayProjects = mode === "done" ? doneProjects : mode === "current" ? activeProjects : projects

  const calculateTotal = (projects: Project[]) => {
    return projects.reduce(
      (acc, project) => {
        acc.energy += project.parameters.energy
        acc.trust += project.parameters.trust
        acc.qol += project.parameters.qol
        acc.skill += project.parameters.skill
        acc.social += project.parameters.social
        return acc
      },
      { energy: 0, trust: 0, qol: 0, skill: 0, social: 0 },
    )
  }

  const currentTotal = calculateTotal(activeProjects)
  const doneTotal = calculateTotal(doneProjects)
  const allTotal = calculateTotal(projects)

  const total = mode === "done" ? doneTotal : mode === "current" ? currentTotal : allTotal
  const totalSum = Object.values(total).reduce((a, b) => a + b, 0)

  const getTopParameter = () => {
    const entries = Object.entries(total)
    const max = Math.max(...entries.map(([, val]) => val))
    const topParam = entries.find(([, val]) => val === max)
    if (!topParam) return null
    const labels: Record<string, { name: string; color: string }> = {
      energy: { name: "エネルギー", color: "bg-orange-600 text-white" },
      trust: { name: "信用", color: "bg-blue-600 text-white" },
      qol: { name: "QoL", color: "bg-green-600 text-white" },
      skill: { name: "スキル", color: "bg-purple-600 text-white" },
      social: { name: "社会関係", color: "bg-yellow-600 text-white" },
    }
    return labels[topParam[0]]
  }

  const getLowParameter = () => {
    const entries = Object.entries(total)
    const min = Math.min(...entries.map(([, val]) => val))
    const lowParam = entries.find(([, val]) => val === min)
    if (!lowParam || min >= 0) return null
    const labels: Record<string, { name: string; color: string }> = {
      energy: { name: "エネルギー", color: "bg-orange-600 text-white" },
      trust: { name: "信用", color: "bg-blue-600 text-white" },
      qol: { name: "QoL", color: "bg-green-600 text-white" },
      skill: { name: "スキル", color: "bg-purple-600 text-white" },
      social: { name: "社会関係", color: "bg-yellow-600 text-white" },
    }
    return labels[lowParam[0]]
  }

  const handleComplete = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      setCompleteModalData({ isOpen: true, project })
    }
  }

  const handleUndo = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: "active" as const, endDate: undefined } : p)),
    )
    setToast(null)
  }

  const handleCreateProject = (data: {
    title: string
    startDate: string
    memo: string
    parameters: {
      energy: number
      trust: number
      qol: number
      skill: number
      social: number
    }
  }) => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: data.title,
      startDate: data.startDate,
      memo: data.memo,
      status: "active",
      parameters: data.parameters,
    }
    setProjects((prev) => [...prev, newProject])
  }

  const handleCompleteSubmit = (data: {
    endDate: string
    parameters: { energy: number; trust: number; qol: number; skill: number; social: number }
  }) => {
    if (!completeModalData.project) return

    setProjects((prev) =>
      prev.map((p) =>
        p.id === completeModalData.project!.id
          ? { ...p, status: "done" as const, endDate: data.endDate, parameters: data.parameters }
          : p,
      ),
    )

    const project = completeModalData.project
    setToast({ message: `"${project.title}" を完了しました`, projectId: project.id })
    setTimeout(() => setToast(null), 5000)
    setCompleteModalData({ isOpen: false, project: null })
  }

  const handleEdit = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      setEditModalData({ isOpen: true, project })
    }
  }

  const handleEditSubmit = (data: {
    title: string
    startDate: string
    endDate?: string
    memo: string
    parameters: { energy: number; trust: number; qol: number; skill: number; social: number }
  }) => {
    if (!editModalData.project) return

    setProjects((prev) =>
      prev.map((p) =>
        p.id === editModalData.project!.id
          ? {
              ...p,
              title: data.title,
              startDate: data.startDate,
              endDate: data.endDate,
              memo: data.memo,
              parameters: data.parameters,
            }
          : p,
      ),
    )

    setEditModalData({ isOpen: false, project: null })
  }

  const topParam = getTopParameter()
  const lowParam = getLowParameter()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-foreground">My Dashboard</h1>
          <div className="flex gap-2">
            <Button
              variant={mode === "done" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("done")}
              className="text-sm"
            >
              終了
            </Button>
            <Button
              variant={mode === "current" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("current")}
              className="text-sm"
            >
              現在
            </Button>
            <Button
              variant={mode === "virtual" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("virtual")}
              className="text-sm"
            >
              仮想
            </Button>
          </div>
        </div>

        {/* Radar Chart Section */}
        <Card className="mb-8 p-8">
          <div className="flex flex-col items-center">
            <RadarChart
              data={total}
              multiData={mode === "virtual" ? { current: currentTotal, done: doneTotal } : undefined}
            />
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="text-sm">
                合計 {totalSum > 0 ? "+" : ""}
                {totalSum}
              </Badge>
              {topParam && <Badge className={`text-sm ${topParam.color}`}>{topParam.name}強め</Badge>}
              {lowParam && <Badge className={`text-sm ${lowParam.color}`}>{lowParam.name}やや低下</Badge>}
            </div>
          </div>
        </Card>

        {/* Projects Section */}
        {activeProjects.length === 0 && mode === "current" ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 text-center">
              <h2 className="mb-2 text-xl font-medium text-foreground">まだデータがありません</h2>
              <p className="text-sm text-muted-foreground">
                最初のプロジェクトを作成して、現在取り組んでいる方向性を可視化しましょう。
              </p>
            </div>
            <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4" />
              プロジェクト作成
            </Button>
          </div>
        ) : (
          <>
            {/* Active Projects */}
            {(mode === "current" || mode === "virtual") && activeProjects.length > 0 && (
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-foreground">進行中</h2>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 bg-transparent"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    プロジェクト追加
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {activeProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} onComplete={handleComplete} onEdit={handleEdit} />
                  ))}
                </div>
              </div>
            )}

            {/* Done Projects */}
            {(mode === "done" || mode === "virtual") && doneProjects.length > 0 && (
              <div>
                <button
                  onClick={() => setIsDoneExpanded(!isDoneExpanded)}
                  className="mb-4 flex w-full items-center gap-2 text-lg font-medium text-foreground hover:text-muted-foreground"
                >
                  {isDoneExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  終了 ({doneProjects.length})
                </button>
                {isDoneExpanded && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {doneProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />

      {editModalData.project && (
        <ProjectModal
          isOpen={editModalData.isOpen}
          onClose={() => setEditModalData({ isOpen: false, project: null })}
          onSubmit={handleEditSubmit}
          project={editModalData.project}
        />
      )}

      {completeModalData.project && (
        <CompleteModal
          isOpen={completeModalData.isOpen}
          onClose={() => setCompleteModalData({ isOpen: false, project: null })}
          project={completeModalData.project}
          onComplete={handleCompleteSubmit}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <Card className="flex items-center gap-3 p-4 shadow-lg">
            <Check className="h-5 w-5 text-green-600" />
            <p className="text-sm text-foreground">{toast.message}</p>
            <Button variant="ghost" size="sm" onClick={() => handleUndo(toast.projectId)} className="ml-2 text-sm">
              元に戻す
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setToast(null)} className="ml-2 h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
