import {
  type Project,
  SAMPLE_PROJECTS,
  calculateTotals,
  getParameterHighlight,
  getTotalByMode,
} from "@/app/page";

let projectSequence = 0;

const createProject = (
  overrides: Partial<Project> & { parameters: Project["parameters"] }
): Project => ({
  id: overrides.id ?? `project-${projectSequence++}`,
  title: overrides.title ?? "テストプロジェクト",
  startDate: overrides.startDate ?? "2024-01-01",
  status: overrides.status ?? "active",
  parameters: overrides.parameters,
  endDate: overrides.endDate,
  memo: overrides.memo,
});

const cloneSampleProjects = (): Project[] =>
  SAMPLE_PROJECTS.map((project) => ({
    ...project,
    parameters: { ...project.parameters },
  }));

describe("dashboard helpers", () => {
  beforeEach(() => {
    projectSequence = 0;
  });

  test("calculateTotals aggregates parameter deltas", () => {
    const projects: Project[] = [
      createProject({
        parameters: {
          energy: 1,
          trust: 2,
          qol: 0,
          skill: -1,
          social: 3,
        },
      }),
      createProject({
        parameters: {
          energy: -2,
          trust: 1,
          qol: 4,
          skill: 0,
          social: -3,
        },
      }),
    ];

    const totals = calculateTotals(projects);

    expect(totals).toEqual({
      energy: -1,
      trust: 3,
      qol: 4,
      skill: -1,
      social: 0,
    });
  });

  test("getTotalByMode selects totals for each dashboard mode", () => {
    const projects = cloneSampleProjects();
    const totals = {
      current: calculateTotals(
        projects.filter((project) => project.status === "active")
      ),
      done: calculateTotals(
        projects.filter((project) => project.status === "done")
      ),
      all: calculateTotals(projects),
    };

    expect(getTotalByMode("current", totals)).toEqual(totals.current);
    expect(getTotalByMode("done", totals)).toEqual(totals.done);
    expect(getTotalByMode("virtual", totals)).toEqual(totals.all);
  });

  test("getParameterHighlight surfaces strongest axis and weakest negative axis", () => {
    const totals = {
      energy: 5,
      trust: -3,
      qol: 0,
      skill: 2,
      social: -1,
    };

    expect(getParameterHighlight(totals, "top")).toMatchObject({
      name: "エネルギー",
    });
    expect(getParameterHighlight(totals, "low")).toMatchObject({
      name: "信用",
    });
  });

  test("getParameterHighlight returns null when no negative values for low variant", () => {
    const totals = {
      energy: 1,
      trust: 0,
      qol: 2,
      skill: 3,
      social: 4,
    };

    expect(getParameterHighlight(totals, "low")).toBeNull();
  });
});
