import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { Project } from "@/app/page";
import { ProjectCard } from "@/components/project-card";

const baseProject: Project = {
  id: "project-1",
  title: "API最適化",
  startDate: "2024-01-01",
  status: "active",
  parameters: {
    energy: 1,
    trust: 0,
    qol: 2,
    skill: -1,
    social: 3,
  },
};

const renderCard = (overrides?: Partial<Project>) =>
  render(<ProjectCard project={{ ...baseProject, ...overrides }} />);

describe("ProjectCard", () => {
  test("invokes quick complete handler when checkbox is toggled", () => {
    const onQuickComplete = vi.fn();
    render(
      <ProjectCard onQuickComplete={onQuickComplete} project={baseProject} />
    );

    fireEvent.click(screen.getByRole("checkbox"));
    expect(onQuickComplete).toHaveBeenCalledWith("project-1");
  });

  test("calls onComplete when 完了 button is pressed", () => {
    const onComplete = vi.fn();
    render(<ProjectCard onComplete={onComplete} project={baseProject} />);

    fireEvent.click(screen.getByRole("button", { name: "完了" }));
    expect(onComplete).toHaveBeenCalledWith("project-1");
  });

  test("hides interactive controls for done projects", () => {
    renderCard({
      status: "done",
      endDate: "2024-02-10",
    });

    expect(screen.queryByRole("button", { name: "完了" })).toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();
  });
});
