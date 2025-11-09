import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { type Project, SAMPLE_PROJECTS, useDashboardState } from "@/app/page";

const cloneProjects = (): Project[] =>
  SAMPLE_PROJECTS.map((project) => ({
    ...project,
    parameters: { ...project.parameters },
  }));

const ZERO_PARAMS: Project["parameters"] = {
  energy: 0,
  trust: 0,
  qol: 0,
  skill: 0,
  social: 0,
};

describe("useDashboardState", () => {
  test("handleQuickComplete moves project to done and schedules toast dismissal", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDashboardState(cloneProjects()));

    act(() => {
      result.current.handleQuickComplete("1");
    });

    expect(
      result.current.doneProjects.find((project) => project.id === "1")?.status
    ).toBe("done");
    expect(result.current.toast?.projectId).toBe("1");

    act(() => {
      vi.runAllTimers();
    });
    expect(result.current.toast).toBeNull();
    vi.useRealTimers();
  });

  test("handleUndo reverts project back to active list", () => {
    const { result } = renderHook(() => useDashboardState(cloneProjects()));

    act(() => {
      result.current.handleQuickComplete("1");
    });
    act(() => {
      result.current.handleUndo("1");
    });

    expect(
      result.current.activeProjects.find((project) => project.id === "1")
    ).toBeTruthy();
    expect(
      result.current.doneProjects.find((project) => project.id === "1")
    ).toBeFalsy();
  });

  test("handleComplete opens modal with selected project", () => {
    const { result } = renderHook(() => useDashboardState(cloneProjects()));

    act(() => {
      result.current.handleComplete("2");
    });

    expect(result.current.completeModalData.project?.id).toBe("2");
  });

  test("handleCompleteSubmit finalizes project and closes modal", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDashboardState(cloneProjects()));

    act(() => {
      result.current.handleComplete("2");
    });

    act(() => {
      result.current.handleCompleteSubmit({
        endDate: "2025-03-01",
        parameters: ZERO_PARAMS,
      });
    });

    expect(
      result.current.doneProjects.find((project) => project.id === "2")?.endDate
    ).toBe("2025-03-01");
    expect(result.current.completeModalData.isOpen).toBe(false);

    act(() => {
      vi.runAllTimers();
    });
    vi.useRealTimers();
  });

  test("handleCreateProject adds a new active project", () => {
    const { result } = renderHook(() => useDashboardState(cloneProjects()));

    act(() => {
      result.current.handleCreateProject({
        title: "新規案件",
        startDate: "2025-02-01",
        memo: "",
        parameters: ZERO_PARAMS,
      });
    });

    expect(
      result.current.activeProjects.find(
        (project) => project.title === "新規案件"
      )
    ).toBeTruthy();
  });

  test("handleEdit opens modal and handleEditSubmit persists updates", () => {
    const { result } = renderHook(() => useDashboardState(cloneProjects()));

    act(() => {
      result.current.handleEdit("1");
    });

    expect(result.current.editModalData.project?.id).toBe("1");

    act(() => {
      result.current.handleEditSubmit({
        title: "タイトル更新",
        startDate: "2024-01-05",
        endDate: undefined,
        memo: "メモ更新",
        parameters: ZERO_PARAMS,
      });
    });

    expect(
      result.current.activeProjects.find((project) => project.id === "1")?.title
    ).toBe("タイトル更新");
    expect(result.current.editModalData.isOpen).toBe(false);
  });
});
