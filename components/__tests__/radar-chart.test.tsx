import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { RadarChart } from "@/components/radar-chart";

const baseData = {
  energy: 1,
  trust: 0,
  qol: -2,
  skill: 3,
  social: 2,
};

describe("RadarChart", () => {
  test("renders all axis labels", () => {
    render(<RadarChart data={baseData} />);

    expect(screen.getByText("エネルギー")).toBeInTheDocument();
    expect(screen.getByText("信用")).toBeInTheDocument();
    expect(screen.getByText("社会関係資本")).toBeInTheDocument();
  });

  test("renders both polygons and legend when multiData is provided", () => {
    const { container } = render(
      <RadarChart
        data={baseData}
        multiData={{
          current: baseData,
          done: { ...baseData, energy: -1, trust: 4 },
        }}
      />
    );

    expect(container.querySelectorAll("polygon")).toHaveLength(2);
    expect(screen.getByText("現在取組中")).toBeVisible();
    expect(screen.getByText("終了")).toBeVisible();
  });
});
