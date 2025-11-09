"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ProjectParameters = {
  energy: number;
  trust: number;
  qol: number;
  skill: number;
  social: number;
};

type ProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    startDate: string;
    endDate?: string;
    memo: string;
    parameters: ProjectParameters;
  }) => void;
  project?: {
    id: string;
    title: string;
    startDate: string;
    endDate?: string;
    memo?: string;
    parameters: ProjectParameters;
  };
};

export function ProjectModal({
  isOpen,
  onClose,
  onSubmit,
  project,
}: ProjectModalProps) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState("");
  const [memo, setMemo] = useState("");
  const [parameters, setParameters] = useState<ProjectParameters>({
    energy: 0,
    trust: 0,
    qol: 0,
    skill: 0,
    social: 0,
  });

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setStartDate(project.startDate);
      setEndDate(project.endDate || "");
      setMemo(project.memo || "");
      setParameters(project.parameters);
    } else {
      setTitle("");
      setStartDate(new Date().toISOString().split("T")[0]);
      setEndDate("");
      setMemo("");
      setParameters({ energy: 0, trust: 0, qol: 0, skill: 0, social: 0 });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      startDate,
      endDate: endDate || undefined,
      memo,
      parameters,
    });
    setTitle("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setMemo("");
    setParameters({ energy: 0, trust: 0, qol: 0, skill: 0, social: 0 });
    onClose();
  };

  const parameterLabels = [
    { key: "energy", label: "エネルギー", color: "text-orange-600" },
    { key: "trust", label: "信用", color: "text-blue-600" },
    { key: "qol", label: "QoL", color: "text-green-600" },
    { key: "skill", label: "スキル", color: "text-purple-600" },
    { key: "social", label: "社会関係資本", color: "text-yellow-600" },
  ] as const;

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {project ? "プロジェクト編集" : "新規プロジェクト作成"}
          </DialogTitle>
          <DialogDescription>
            プロジェクトの詳細と各パラメーターへの影響を入力してください。
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="プロジェクト名を入力"
              required
              value={title}
            />
          </div>

          <DatePickerField
            id="startDate"
            label="開始日"
            onChange={setStartDate}
            placeholder="開始日を選択"
            required
            value={startDate}
          />

          <DatePickerField
            allowClear
            id="endDate"
            label="終了予定日（任意）"
            onChange={setEndDate}
            placeholder="設定しない"
            value={endDate}
          />

          <div className="space-y-2">
            <Label htmlFor="memo">メモ</Label>
            <Textarea
              id="memo"
              onChange={(e) => setMemo(e.target.value)}
              placeholder="プロジェクトの説明やメモ"
              rows={3}
              value={memo}
            />
          </div>

          <div className="space-y-4">
            <Label>パラメーター（-5 〜 +5）</Label>
            {parameterLabels.map(({ key, label, color }) => (
              <div className="space-y-2" key={key}>
                <div className="flex items-center justify-between">
                  <span className={`font-medium text-sm ${color}`}>
                    {label}
                  </span>
                  <span className="font-semibold text-foreground text-sm">
                    {parameters[key] > 0 ? "+" : ""}
                    {parameters[key]}
                  </span>
                </div>
                <Slider
                  className="w-full"
                  max={5}
                  min={-5}
                  onValueChange={(value) =>
                    setParameters((prev) => ({ ...prev, [key]: value[0] }))
                  }
                  step={1}
                  value={[parameters[key]]}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <Button onClick={onClose} type="button" variant="outline">
              キャンセル
            </Button>
            <Button type="submit">{project ? "更新" : "作成"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type CompleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  project: {
    title: string;
    parameters: ProjectParameters;
  };
  onComplete: (data: {
    endDate: string;
    parameters: ProjectParameters;
  }) => void;
};

export function CompleteModal({
  isOpen,
  onClose,
  project,
  onComplete,
}: CompleteModalProps) {
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [parameters, setParameters] = useState<ProjectParameters>(
    project.parameters
  );

  useEffect(() => {
    setParameters(project.parameters);
    setEndDate(new Date().toISOString().split("T")[0]);
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ endDate, parameters });
    onClose();
  };

  const parameterLabels = [
    { key: "energy", label: "エネルギー", color: "text-orange-600" },
    { key: "trust", label: "信用", color: "text-blue-600" },
    { key: "qol", label: "QoL", color: "text-green-600" },
    { key: "skill", label: "スキル", color: "text-purple-600" },
    { key: "social", label: "社会関係資本", color: "text-yellow-600" },
  ] as const;

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>プロジェクト完了</DialogTitle>
          <DialogDescription>
            {project.title}の終了日と最終的なパラメーターを調整してください。
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <DatePickerField
            id="complete-end-date"
            label="終了日"
            onChange={setEndDate}
            placeholder="終了日を選択"
            required
            value={endDate}
          />

          <div className="space-y-4">
            <Label>最終パラメーター調整（-5 〜 +5）</Label>
            {parameterLabels.map(({ key, label, color }) => (
              <div className="space-y-2" key={key}>
                <div className="flex items-center justify-between">
                  <span className={`font-medium text-sm ${color}`}>
                    {label}
                  </span>
                  <span className="font-semibold text-foreground text-sm">
                    {parameters[key] > 0 ? "+" : ""}
                    {parameters[key]}
                  </span>
                </div>
                <Slider
                  className="w-full"
                  max={5}
                  min={-5}
                  onValueChange={(value) =>
                    setParameters((prev) => ({ ...prev, [key]: value[0] }))
                  }
                  step={1}
                  value={[parameters[key]]}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <Button onClick={onClose} type="button" variant="outline">
              キャンセル
            </Button>
            <Button type="submit">完了する</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type DatePickerFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  allowClear?: boolean;
};

function DatePickerField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  allowClear = false,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = value ? new Date(value) : undefined;

  const handleSelect = (date?: Date) => {
    if (!date) {
      return;
    }
    onChange(format(date, "yyyy-MM-dd"));
    setOpen(false);
  };

  const displayValue = selectedDate
    ? format(selectedDate, "yyyy年M月d日")
    : (placeholder ?? "日付を選択");

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
            id={id}
            type="button"
            variant="outline"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayValue}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0" side="bottom">
          <Calendar
            defaultMonth={selectedDate}
            initialFocus
            mode="single"
            onSelect={handleSelect}
            selected={selectedDate}
          />
        </PopoverContent>
      </Popover>
      {allowClear && value && (
        <Button
          className="h-auto p-0 text-muted-foreground text-xs underline-offset-2 hover:underline"
          onClick={() => onChange("")}
          type="button"
          variant="ghost"
        >
          日付をクリア
        </Button>
      )}
    </div>
  );
}
