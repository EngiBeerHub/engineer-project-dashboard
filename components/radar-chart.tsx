"use client"

type RadarChartProps = {
  data: {
    energy: number
    trust: number
    qol: number
    skill: number
    social: number
  }
  multiData?: {
    current: {
      energy: number
      trust: number
      qol: number
      skill: number
      social: number
    }
    done: {
      energy: number
      trust: number
      qol: number
      skill: number
      social: number
    }
  }
}

export function RadarChart({ data, multiData }: RadarChartProps) {
  const labels = [
    { key: "energy", label: "エネルギー", color: "rgb(234, 88, 12)" },
    { key: "trust", label: "信用", color: "rgb(37, 99, 235)" },
    { key: "qol", label: "人生の質", color: "rgb(22, 163, 74)" },
    { key: "skill", label: "スキル", color: "rgb(147, 51, 234)" },
    { key: "social", label: "社会関係資本", color: "rgb(202, 138, 4)" },
  ]

  const maxValue = 5
  const centerX = 250
  const centerY = 250
  const radius = 150
  const levels = 5

  // Calculate points for the data polygon
  const calculatePoint = (value: number, angle: number) => {
    const normalizedValue = Math.max(-5, Math.min(5, value))
    const distance = ((normalizedValue + 5) / 10) * radius
    return {
      x: centerX + distance * Math.cos(angle - Math.PI / 2),
      y: centerY + distance * Math.sin(angle - Math.PI / 2),
    }
  }

  const angleStep = (Math.PI * 2) / labels.length

  const dataPoints = labels.map((label, i) => {
    const value = data[label.key as keyof typeof data]
    return calculatePoint(value, angleStep * i)
  })

  const currentDataPoints = multiData
    ? labels.map((label, i) => {
        const value = multiData.current[label.key as keyof typeof multiData.current]
        return calculatePoint(value, angleStep * i)
      })
    : []

  const doneDataPoints = multiData
    ? labels.map((label, i) => {
        const value = multiData.done[label.key as keyof typeof multiData.done]
        return calculatePoint(value, angleStep * i)
      })
    : []

  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ")
  const currentPolygonPoints = currentDataPoints.map((p) => `${p.x},${p.y}`).join(" ")
  const donePolygonPoints = doneDataPoints.map((p) => `${p.x},${p.y}`).join(" ")

  return (
    <div className="w-full max-w-md">
      <svg viewBox="0 0 500 500" className="w-full" aria-label="レーダーチャート">
        {/* Background circles */}
        {Array.from({ length: levels }).map((_, i) => {
          const r = ((i + 1) / levels) * radius
          return (
            <circle
              key={i}
              cx={centerX}
              cy={centerY}
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-border"
              opacity={0.3}
            />
          )
        })}

        {/* Axis lines */}
        {labels.map((_, i) => {
          const angle = angleStep * i
          const x = centerX + radius * Math.cos(angle - Math.PI / 2)
          const y = centerY + radius * Math.sin(angle - Math.PI / 2)
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-border"
              opacity={0.3}
            />
          )
        })}

        {multiData ? (
          <>
            {/* Done projects polygon */}
            <polygon
              points={donePolygonPoints}
              fill="rgb(107, 114, 128)"
              fillOpacity="0.2"
              stroke="rgb(107, 114, 128)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {doneDataPoints.map((point, i) => (
              <circle key={`done-${i}`} cx={point.x} cy={point.y} r="3" fill="rgb(107, 114, 128)" />
            ))}

            {/* Current projects polygon */}
            <polygon
              points={currentPolygonPoints}
              fill="rgb(20, 184, 166)"
              fillOpacity="0.2"
              stroke="rgb(20, 184, 166)"
              strokeWidth="2"
            />
            {currentDataPoints.map((point, i) => (
              <circle key={`current-${i}`} cx={point.x} cy={point.y} r="4" fill="rgb(20, 184, 166)" />
            ))}
          </>
        ) : (
          <>
            {/* Single data polygon */}
            <polygon
              points={polygonPoints}
              fill="rgb(20, 184, 166)"
              fillOpacity="0.25"
              stroke="rgb(20, 184, 166)"
              strokeWidth="2"
            />
            {dataPoints.map((point, i) => (
              <circle key={i} cx={point.x} cy={point.y} r="4" fill="rgb(20, 184, 166)" />
            ))}
          </>
        )}

        {/* Labels */}
        {labels.map((label, i) => {
          const angle = angleStep * i
          const labelDistance = radius + 40
          const x = centerX + labelDistance * Math.cos(angle - Math.PI / 2)
          const y = centerY + labelDistance * Math.sin(angle - Math.PI / 2)

          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={label.color}
              className="text-xs font-semibold"
            >
              {label.label}
            </text>
          )
        })}
      </svg>

      {multiData && (
        <div className="mt-4 flex justify-center gap-4 text-xs">
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
  )
}
