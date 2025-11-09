"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"

type ProjectParameters = {
  energy: number
  trust: number
  qol: number
  skill: number
  social: number
}

type ProjectModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    startDate: string
    endDate?: string
    memo: string
    parameters: ProjectParameters
  }) => void
  project?: {
    id: string
    title: string
    startDate: string
    endDate?: string
    memo?: string
    parameters: ProjectParameters
  }
}

export function ProjectModal({ isOpen, onClose, onSubmit, project }: ProjectModalProps) {
  const [title, setTitle] = useState("")
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState("")
  const [memo, setMemo] = useState("")
  const [parameters, setParameters] = useState<ProjectParameters>({
    energy: 0,
    trust: 0,
    qol: 0,
    skill: 0,
    social: 0,
  })

  useEffect(() => {
    if (project) {
      setTitle(project.title)
      setStartDate(project.startDate)
      setEndDate(project.endDate || "")
      setMemo(project.memo || "")
      setParameters(project.parameters)
    } else {
      setTitle("")
      setStartDate(new Date().toISOString().split("T")[0])
      setEndDate("")
      setMemo("")
      setParameters({ energy: 0, trust: 0, qol: 0, skill: 0, social: 0 })
    }
  }, [project, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ title, startDate, endDate: endDate || undefined, memo, parameters })
    setTitle("")
    setStartDate(new Date().toISOString().split("T")[0])
    setEndDate("")
    setMemo("")
    setParameters({ energy: 0, trust: 0, qol: 0, skill: 0, social: 0 })
    onClose()
  }

  const parameterLabels = [
    { key: "energy", label: "エネルギー", color: "text-orange-600" },
    { key: "trust", label: "信用", color: "text-blue-600" },
    { key: "qol", label: "QoL", color: "text-green-600" },
    { key: "skill", label: "スキル", color: "text-purple-600" },
    { key: "social", label: "社会関係資本", color: "text-yellow-600" },
  ] as const

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{project ? "プロジェクト編集" : "新規プロジェクト作成"}</DialogTitle>
          <DialogDescription>プロジェクトの詳細と各パラメーターへの影響を入力してください。</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="プロジェクト名を入力"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">開始日</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">終了予定日（任意）</Label>
            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo">メモ</Label>
            <Textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="プロジェクトの説明やメモ"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <Label>パラメーター（-5 〜 +5）</Label>
            {parameterLabels.map(({ key, label, color }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${color}`}>{label}</span>
                  <span className="text-sm font-semibold text-foreground">
                    {parameters[key] > 0 ? "+" : ""}
                    {parameters[key]}
                  </span>
                </div>
                <Slider
                  value={[parameters[key]]}
                  onValueChange={(value) => setParameters((prev) => ({ ...prev, [key]: value[0] }))}
                  min={-5}
                  max={5}
                  step={1}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit">{project ? "更新" : "作成"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

type CompleteModalProps = {
  isOpen: boolean
  onClose: () => void
  project: {
    title: string
    parameters: ProjectParameters
  }
  onComplete: (data: { endDate: string; parameters: ProjectParameters }) => void
}

export function CompleteModal({ isOpen, onClose, project, onComplete }: CompleteModalProps) {
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const [parameters, setParameters] = useState<ProjectParameters>(project.parameters)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete({ endDate, parameters })
    onClose()
  }

  const parameterLabels = [
    { key: "energy", label: "エネルギー", color: "text-orange-600" },
    { key: "trust", label: "信用", color: "text-blue-600" },
    { key: "qol", label: "QoL", color: "text-green-600" },
    { key: "skill", label: "スキル", color: "text-purple-600" },
    { key: "social", label: "社会関係資本", color: "text-yellow-600" },
  ] as const

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>プロジェクト完了</DialogTitle>
          <DialogDescription>{project.title}の終了日と最終的なパラメーターを調整してください。</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="endDate">終了日</Label>
            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          </div>

          <div className="space-y-4">
            <Label>最終パラメーター調整（-5 〜 +5）</Label>
            {parameterLabels.map(({ key, label, color }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${color}`}>{label}</span>
                  <span className="text-sm font-semibold text-foreground">
                    {parameters[key] > 0 ? "+" : ""}
                    {parameters[key]}
                  </span>
                </div>
                <Slider
                  value={[parameters[key]]}
                  onValueChange={(value) => setParameters((prev) => ({ ...prev, [key]: value[0] }))}
                  min={-5}
                  max={5}
                  step={1}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit">完了する</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
