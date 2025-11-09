"use client";

type RadarChartProps = {
  data: {
    energy: number;
    trust: number;
    qol: number;
    skill: number;
    social: number;
  };
  multiData?: {
    current: {
      energy: number;
      trust: number;
      qol: number;
      skill: number;
      social: number;
    };
    done: {
      energy: number;
      trust: number;
      qol: number;
      skill: number;
      social: number;
    };
  };
};

export function RadarChart({ data, multiData }: RadarChartProps) {
  const labels = [
    { key: "energy", label: "エネルギー", color: "rgb(234, 88, 12)" },
    { key: "trust", label: "信用", color: "rgb(37, 99, 235)" },
    { key: "qol", label: "人生の質", color: "rgb(22, 163, 74)" },
    { key: "skill", label: "スキル", color: "rgb(147, 51, 234)" },
    { key: "social", label: "社会関係資本", color: "rgb(202, 138, 4)" },
  ];

  const centerX = 250;
  const centerY = 250;
  const radius = 150;
  const levels = 5;
  const levelSteps = Array.from(
    { length: levels },
    (_, levelIndex) => levelIndex + 1
  );

  // Calculate points for the data polygon
  const calculatePoint = (value: number, angle: number) => {
    const normalizedValue = Math.max(-5, Math.min(5, value));
    const distance = ((normalizedValue + 5) / 10) * radius;
    return {
      x: centerX + distance * Math.cos(angle - Math.PI / 2),
      y: centerY + distance * Math.sin(angle - Math.PI / 2),
    };
  };

  const angleStep = (Math.PI * 2) / labels.length;

  const dataPoints = labels.map((label, i) => {
    const value = data[label.key as keyof typeof data];
    return {
      key: label.key,
      ...calculatePoint(value, angleStep * i),
    };
  });

  const currentDataPoints = multiData
    ? labels.map((label, i) => {
        const value =
          multiData.current[label.key as keyof typeof multiData.current];
        return {
          key: label.key,
          ...calculatePoint(value, angleStep * i),
        };
      })
    : [];

  const doneDataPoints = multiData
    ? labels.map((label, i) => {
        const value = multiData.done[label.key as keyof typeof multiData.done];
        return {
          key: label.key,
          ...calculatePoint(value, angleStep * i),
        };
      })
    : [];

  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const currentPolygonPoints = currentDataPoints
    .map((p) => `${p.x},${p.y}`)
    .join(" ");
  const donePolygonPoints = doneDataPoints
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  return (
    <div className="w-full max-w-md">
      <svg
        aria-label="レーダーチャート"
        className="w-full"
        viewBox="0 0 500 500"
      >
        <title>レーダーチャート</title>
        {/* Background circles */}
        {levelSteps.map((level) => {
          const r = (level / levels) * radius;
          return (
            <circle
              className="text-border"
              cx={centerX}
              cy={centerY}
              fill="none"
              key={`level-${level}`}
              opacity={0.3}
              r={r}
              stroke="currentColor"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis lines */}
        {labels.map((label, i) => {
          const angle = angleStep * i;
          const x = centerX + radius * Math.cos(angle - Math.PI / 2);
          const y = centerY + radius * Math.sin(angle - Math.PI / 2);
          return (
            <line
              className="text-border"
              key={`axis-${label.key}`}
              opacity={0.3}
              stroke="currentColor"
              strokeWidth="1"
              x1={centerX}
              x2={x}
              y1={centerY}
              y2={y}
            />
          );
        })}

        {multiData ? (
          <>
            {/* Done projects polygon */}
            <polygon
              fill="rgb(107, 114, 128)"
              fillOpacity="0.2"
              points={donePolygonPoints}
              stroke="rgb(107, 114, 128)"
              strokeDasharray="4 4"
              strokeWidth="2"
            />
            {doneDataPoints.map((point) => (
              <circle
                cx={point.x}
                cy={point.y}
                fill="rgb(107, 114, 128)"
                key={`done-${point.key}`}
                r="3"
              />
            ))}

            {/* Current projects polygon */}
            <polygon
              fill="rgb(20, 184, 166)"
              fillOpacity="0.2"
              points={currentPolygonPoints}
              stroke="rgb(20, 184, 166)"
              strokeWidth="2"
            />
            {currentDataPoints.map((point) => (
              <circle
                cx={point.x}
                cy={point.y}
                fill="rgb(20, 184, 166)"
                key={`current-${point.key}`}
                r="4"
              />
            ))}
          </>
        ) : (
          <>
            {/* Single data polygon */}
            <polygon
              fill="rgb(20, 184, 166)"
              fillOpacity="0.25"
              points={polygonPoints}
              stroke="rgb(20, 184, 166)"
              strokeWidth="2"
            />
            {dataPoints.map((point) => (
              <circle
                cx={point.x}
                cy={point.y}
                fill="rgb(20, 184, 166)"
                key={point.key}
                r="4"
              />
            ))}
          </>
        )}

        {/* Labels */}
        {labels.map((label, i) => {
          const angle = angleStep * i;
          const labelDistance = radius + 40;
          const x = centerX + labelDistance * Math.cos(angle - Math.PI / 2);
          const y = centerY + labelDistance * Math.sin(angle - Math.PI / 2);

          return (
            <text
              className="font-semibold text-sm sm:text-base"
              dominantBaseline="middle"
              fill={label.color}
              key={`label-${label.key}`}
              textAnchor="middle"
              x={x}
              y={y}
            >
              {label.label}
            </text>
          );
        })}
      </svg>

      {multiData && (
        <div className="mt-4 flex justify-center gap-4 text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-teal-500" />
            <span className="text-muted-foreground">現在取組中</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-500" />
            <span className="text-muted-foreground">終了</span>
          </div>
        </div>
      )}
    </div>
  );
}
