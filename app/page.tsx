"use client";

import { Check, ChevronDown, ChevronRight, Plus, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { ProjectCard } from "@/components/project-card";
import { CompleteModal, ProjectModal } from "@/components/project-modal";
import { RadarChart } from "@/components/radar-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
];

type DashboardMode = "current" | "done" | "virtual";

type ProjectTotals = {
  energy: number;
  trust: number;
  qol: number;
  skill: number;
  social: number;
};

type ModalState = {
  isOpen: boolean;
  project: Project | null;
};

type ToastState = {
  message: string;
  projectId: string;
} | null;

const PARAMETER_LABELS: Record<
  keyof ProjectTotals,
  { name: string; color: string }
> = {
  energy: { name: "エネルギー", color: "bg-orange-600 text-white" },
  trust: { name: "信用", color: "bg-blue-600 text-white" },
  qol: { name: "QoL", color: "bg-green-600 text-white" },
  skill: { name: "スキル", color: "bg-purple-600 text-white" },
  social: { name: "社会関係", color: "bg-yellow-600 text-white" },
};

const createEmptyTotals = (): ProjectTotals => ({
  energy: 0,
  trust: 0,
  qol: 0,
  skill: 0,
  social: 0,
});

const calculateTotals = (list: Project[]): ProjectTotals =>
  list.reduce((acc, project) => {
    acc.energy += project.parameters.energy;
    acc.trust += project.parameters.trust;
    acc.qol += project.parameters.qol;
    acc.skill += project.parameters.skill;
    acc.social += project.parameters.social;
    return acc;
  }, createEmptyTotals());

const getParameterHighlight = (
  totals: ProjectTotals,
  variant: "top" | "low"
) => {
  const entries = Object.entries(totals) as [keyof ProjectTotals, number][];
  if (entries.length === 0) {
    return null;
  }

  if (variant === "top") {
    const [topKey] = entries.reduce((maxEntry, currentEntry) =>
      currentEntry[1] > maxEntry[1] ? currentEntry : maxEntry
    );
    return PARAMETER_LABELS[topKey];
  }

  const [lowKey, value] = entries.reduce((minEntry, currentEntry) =>
    currentEntry[1] < minEntry[1] ? currentEntry : minEntry
  );

  if (value >= 0) {
    return null;
  }
  return PARAMETER_LABELS[lowKey];
};

const getTotalByMode = (
  mode: DashboardMode,
  totals: {
    current: ProjectTotals;
    done: ProjectTotals;
    all: ProjectTotals;
  }
) => {
  if (mode === "done") {
    return totals.done;
  }
  if (mode === "current") {
    return totals.current;
  }
  return totals.all;
};

function useDashboardState(initialProjects: Project[]) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [mode, setMode] = useState<DashboardMode>("current");
  const [isDoneExpanded, setIsDoneExpanded] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState<ModalState>({
    isOpen: false,
    project: null,
  });
  const [completeModalData, setCompleteModalData] = useState<ModalState>({
    isOpen: false,
    project: null,
  });

  const activeProjects = useMemo(
    () => projects.filter((project) => project.status === "active"),
    [projects]
  );
  const doneProjects = useMemo(
    () => projects.filter((project) => project.status === "done"),
    [projects]
  );

  const currentTotal = useMemo(
    () => calculateTotals(activeProjects),
    [activeProjects]
  );
  const doneTotal = useMemo(
    () => calculateTotals(doneProjects),
    [doneProjects]
  );
  const allTotal = useMemo(() => calculateTotals(projects), [projects]);

  const total = useMemo(
    () =>
      getTotalByMode(mode, {
        current: currentTotal,
        done: doneTotal,
        all: allTotal,
      }),
    [allTotal, currentTotal, doneTotal, mode]
  );

  const totalSum = useMemo(
    () => Object.values(total).reduce((sum, value) => sum + value, 0),
    [total]
  );

  const topParam = useMemo(() => getParameterHighlight(total, "top"), [total]);
  const lowParam = useMemo(() => getParameterHighlight(total, "low"), [total]);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const handleComplete = useCallback(
    (projectId: string) => {
      const project = projects.find((p) => p.id === projectId);
      if (!project) {
        return;
      }
      setCompleteModalData({ isOpen: true, project });
    },
    [projects]
  );

  const handleUndo = useCallback(
    (projectId: string) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, status: "active" as const, endDate: undefined }
            : p
        )
      );
      dismissToast();
    },
    [dismissToast]
  );

  const handleCreateProject = useCallback(
    (data: {
      title: string;
      startDate: string;
      memo: string;
      parameters: Project["parameters"];
    }) => {
      const newProject: Project = {
        id: Date.now().toString(),
        title: data.title,
        startDate: data.startDate,
        memo: data.memo,
        status: "active",
        parameters: data.parameters,
      };
      setProjects((prev) => [...prev, newProject]);
    },
    []
  );

  const handleCompleteSubmit = useCallback(
    (data: { endDate: string; parameters: Project["parameters"] }) => {
      if (!completeModalData.project) {
        return;
      }
      const project = completeModalData.project;

      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id
            ? {
                ...p,
                status: "done" as const,
                endDate: data.endDate,
                parameters: data.parameters,
              }
            : p
        )
      );

      setToast({
        message: `"${project.title}" を完了しました`,
        projectId: project.id,
      });
      setTimeout(dismissToast, 5000);
      setCompleteModalData({ isOpen: false, project: null });
    },
    [completeModalData.project, dismissToast]
  );

  const handleEdit = useCallback(
    (projectId: string) => {
      const project = projects.find((p) => p.id === projectId);
      if (!project) {
        return;
      }
      setEditModalData({ isOpen: true, project });
    },
    [projects]
  );

  const handleEditSubmit = useCallback(
    (data: {
      title: string;
      startDate: string;
      endDate?: string;
      memo: string;
      parameters: Project["parameters"];
    }) => {
      if (!editModalData.project) {
        return;
      }

      const project = editModalData.project;
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id
            ? {
                ...p,
                title: data.title,
                startDate: data.startDate,
                endDate: data.endDate,
                memo: data.memo,
                parameters: data.parameters,
              }
            : p
        )
      );

      setEditModalData({ isOpen: false, project: null });
    },
    [editModalData.project]
  );

  return {
    activeProjects,
    doneProjects,
    mode,
    setMode,
    isDoneExpanded,
    setIsDoneExpanded,
    toast,
    dismissToast,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editModalData,
    setEditModalData,
    completeModalData,
    setCompleteModalData,
    currentTotal,
    doneTotal,
    total,
    totalSum,
    topParam,
    lowParam,
    handleComplete,
    handleUndo,
    handleCreateProject,
    handleCompleteSubmit,
    handleEdit,
    handleEditSubmit,
  };
}

type ModeToggleProps = {
  mode: DashboardMode;
  onChange: (mode: DashboardMode) => void;
  className?: string;
};

function ModeToggle({ mode, onChange, className }: ModeToggleProps) {
  const options: { value: DashboardMode; label: string }[] = [
    { value: "done", label: "終了" },
    { value: "current", label: "現在" },
    { value: "virtual", label: "仮想" },
  ];

  return (
    <div
      className={cn(
        "flex w-full flex-wrap gap-2 sm:w-auto sm:flex-nowrap sm:justify-end",
        className
      )}
    >
      {options.map((option) => (
        <Button
          className="text-sm"
          key={option.value}
          onClick={() => onChange(option.value)}
          size="sm"
          variant={mode === option.value ? "default" : "outline"}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

type RadarSummaryProps = {
  mode: DashboardMode;
  total: ProjectTotals;
  totalSum: number;
  topParam: { name: string; color: string } | null;
  lowParam: { name: string; color: string } | null;
  currentTotal: ProjectTotals;
  doneTotal: ProjectTotals;
};

function RadarSummary({
  mode,
  total,
  totalSum,
  topParam,
  lowParam,
  currentTotal,
  doneTotal,
}: RadarSummaryProps) {
  return (
    <Card className="mb-8 p-8">
      <div className="flex flex-col items-center">
        <RadarChart
          data={total}
          multiData={
            mode === "virtual"
              ? { current: currentTotal, done: doneTotal }
              : undefined
          }
        />
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Badge className="text-sm" variant="secondary">
            合計 {totalSum > 0 ? "+" : ""}
            {totalSum}
          </Badge>
          {topParam && (
            <Badge className={`text-sm ${topParam.color}`}>
              {topParam.name}強め
            </Badge>
          )}
          {lowParam && (
            <Badge className={`text-sm ${lowParam.color}`}>
              {lowParam.name}やや低下
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

type ProjectsSectionProps = {
  mode: DashboardMode;
  activeProjects: Project[];
  doneProjects: Project[];
  isDoneExpanded: boolean;
  onCreate: () => void;
  onToggleDone: () => void;
  onComplete: (id: string) => void;
  onEdit: (id: string) => void;
};

function ProjectsSection({
  mode,
  activeProjects,
  doneProjects,
  isDoneExpanded,
  onCreate,
  onToggleDone,
  onComplete,
  onEdit,
}: ProjectsSectionProps) {
  const shouldShowEmptyState =
    activeProjects.length === 0 && mode === "current";
  if (shouldShowEmptyState) {
    return <EmptyProjectsState onCreate={onCreate} />;
  }

  return (
    <>
      <ActiveProjectsSection
        mode={mode}
        onComplete={onComplete}
        onCreate={onCreate}
        onEdit={onEdit}
        projects={activeProjects}
      />
      <DoneProjectsSection
        isExpanded={isDoneExpanded}
        mode={mode}
        onToggle={onToggleDone}
        projects={doneProjects}
      />
    </>
  );
}

const EmptyProjectsState = ({ onCreate }: { onCreate: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="mb-4 text-center">
      <h2 className="mb-2 font-medium text-foreground text-xl">
        まだデータがありません
      </h2>
      <p className="text-muted-foreground text-sm">
        最初のプロジェクトを作成して、現在取り組んでいる方向性を可視化しましょう。
      </p>
    </div>
    <Button className="gap-2" onClick={onCreate}>
      <Plus className="h-4 w-4" />
      プロジェクト作成
    </Button>
  </div>
);

type ActiveProjectsSectionProps = {
  mode: DashboardMode;
  projects: Project[];
  onCreate: () => void;
  onComplete: (id: string) => void;
  onEdit: (id: string) => void;
};

function ActiveProjectsSection({
  mode,
  projects,
  onCreate,
  onComplete,
  onEdit,
}: ActiveProjectsSectionProps) {
  const shouldRender =
    (mode === "current" || mode === "virtual") && projects.length > 0;
  if (!shouldRender) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-medium text-foreground text-lg">進行中</h2>
        <Button
          className="gap-2 bg-transparent"
          onClick={onCreate}
          size="sm"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          プロジェクト追加
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            onComplete={onComplete}
            onEdit={onEdit}
            project={project}
          />
        ))}
      </div>
    </div>
  );
}

type DoneProjectsSectionProps = {
  mode: DashboardMode;
  projects: Project[];
  isExpanded: boolean;
  onToggle: () => void;
};

function DoneProjectsSection({
  mode,
  projects,
  isExpanded,
  onToggle,
}: DoneProjectsSectionProps) {
  const shouldRender =
    (mode === "done" || mode === "virtual") && projects.length > 0;
  if (!shouldRender) {
    return null;
  }

  return (
    <div>
      <button
        className="mb-4 flex w-full items-center gap-2 font-medium text-foreground text-lg hover:text-muted-foreground"
        onClick={onToggle}
        type="button"
      >
        {isExpanded ? (
          <ChevronDown className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
        終了 ({projects.length})
      </button>
      {isExpanded && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

type ToastNotificationProps = {
  toast: ToastState;
  onUndo: (projectId: string) => void;
  onDismiss: () => void;
};

function ToastNotification({
  toast,
  onUndo,
  onDismiss,
}: ToastNotificationProps) {
  if (!toast) {
    return null;
  }

  return (
    <div className="slide-in-from-bottom-5 fixed right-6 bottom-6 z-50 animate-in">
      <Card className="flex items-center gap-3 p-4 shadow-lg">
        <Check className="h-5 w-5 text-green-600" />
        <p className="text-foreground text-sm">{toast.message}</p>
        <Button
          className="ml-2 text-sm"
          onClick={() => onUndo(toast.projectId)}
          size="sm"
          variant="ghost"
        >
          元に戻す
        </Button>
        <Button
          className="ml-2 h-6 w-6"
          onClick={onDismiss}
          size="icon"
          variant="ghost"
        >
          <X className="h-4 w-4" />
        </Button>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const {
    activeProjects,
    doneProjects,
    mode,
    setMode,
    isDoneExpanded,
    setIsDoneExpanded,
    toast,
    dismissToast,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editModalData,
    setEditModalData,
    completeModalData,
    setCompleteModalData,
    currentTotal,
    doneTotal,
    total,
    totalSum,
    topParam,
    lowParam,
    handleComplete,
    handleUndo,
    handleCreateProject,
    handleCompleteSubmit,
    handleEdit,
    handleEditSubmit,
  } = useDashboardState(sampleProjects);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-semibold text-3xl text-foreground">
            Your Dashboard
          </h1>
          <ModeToggle mode={mode} onChange={(value) => setMode(value)} />
        </div>

        <RadarSummary
          currentTotal={currentTotal}
          doneTotal={doneTotal}
          lowParam={lowParam}
          mode={mode}
          topParam={topParam}
          total={total}
          totalSum={totalSum}
        />

        <ProjectsSection
          activeProjects={activeProjects}
          doneProjects={doneProjects}
          isDoneExpanded={isDoneExpanded}
          mode={mode}
          onComplete={handleComplete}
          onCreate={() => setIsCreateModalOpen(true)}
          onEdit={handleEdit}
          onToggleDone={() => setIsDoneExpanded((previous) => !previous)}
        />
      </div>

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
          onComplete={handleCompleteSubmit}
          project={completeModalData.project}
        />
      )}

      <ToastNotification
        onDismiss={dismissToast}
        onUndo={handleUndo}
        toast={toast}
      />
    </div>
  );
}
