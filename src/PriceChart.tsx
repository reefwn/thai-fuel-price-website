import { signal, type Signal } from '@preact/signals'

export type Point = { date: string; price: number }

// Hover state (internal)
const hovered = signal<Point | null>(null)
const hoveredIdx = signal(-1)
const tooltipX = signal(0)
const tooltipY = signal(0)

const W = 420
const H = 180
const PAD = { top: 12, right: 12, bottom: 32, left: 44 }
const INNER_W = W - PAD.left - PAD.right
const INNER_H = H - PAD.top - PAD.bottom

function buildPath(points: Point[], minP: number, maxP: number): { area: string; line: string } {
  if (points.length < 2) return { area: '', line: '' }
  const range = maxP - minP || 1
  const coords = points.map((pt, i) => {
    const x = PAD.left + (i / (points.length - 1)) * INNER_W
    const y = PAD.top + (1 - (pt.price - minP) / range) * INNER_H
    return [x, y] as [number, number]
  })
  const line = coords.reduce((acc, [x, y], i) => {
    if (i === 0) return `M ${x},${y}`
    const [px, py] = coords[i - 1]
    const cpx = (px + x) / 2
    return `${acc} C ${cpx},${py} ${cpx},${y} ${x},${y}`
  }, '')
  const first = coords[0]
  const last = coords[coords.length - 1]
  const area = `${line} L ${last[0]},${PAD.top + INNER_H} L ${first[0]},${PAD.top + INNER_H} Z`
  return { area, line }
}

function yTicks(minP: number, maxP: number, count = 4): number[] {
  const step = (maxP - minP) / (count - 1) || 1
  return Array.from({ length: count }, (_, i) => minP + step * i)
}

function monthLabel(date: string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ptToXY(idx: number, price: number, total: number, yMin: number, yMax: number) {
  const x = PAD.left + (idx / (total - 1)) * INNER_W
  const range = yMax - yMin || 1
  const y = PAD.top + (1 - (price - yMin) / range) * INNER_H
  return { x, y }
}

interface Props {
  points: Point[]
  color?: string
  dateA: Signal<string>
  dateB: Signal<string>
}

export function PriceChart({ points, color = '#4F46E5', dateA, dateB }: Props) {
  if (points.length === 0) return null

  const prices = points.map(p => p.price)
  const minP = Math.min(...prices)
  const maxP = Math.max(...prices)
  const pad = (maxP - minP) * 0.15 || 1
  const yMin = minP - pad
  const yMax = maxP + pad

  const { area, line } = buildPath(points, yMin, yMax)
  const ticks = yTicks(minP, maxP)
  const xLabelIdxs = [0, Math.floor(points.length / 3), Math.floor((2 * points.length) / 3), points.length - 1]

  // Find indices for pinned selections
  const idxA = points.findIndex(p => p.date === dateA.value)
  const idxB = points.findIndex(p => p.date === dateB.value)

  function resolveIdx(e: MouseEvent): number {
    const svg = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
    const scaleX = W / svg.width
    const relX = (e.clientX - svg.left) * scaleX - PAD.left
    const idx = Math.round((relX / INNER_W) * (points.length - 1))
    return Math.max(0, Math.min(points.length - 1, idx))
  }

  function handleMouseMove(e: MouseEvent) {
    const clamped = resolveIdx(e)
    hovered.value = points[clamped]
    hoveredIdx.value = clamped
    const { x, y } = ptToXY(clamped, points[clamped].price, points.length, yMin, yMax)
    tooltipX.value = x
    tooltipY.value = y
  }

  function handleClick(e: MouseEvent) {
    const clamped = resolveIdx(e)
    const clickedDate = points[clamped].date

    // If both are set, start fresh with new A
    if (dateA.value && dateB.value) {
      dateA.value = clickedDate
      dateB.value = ''
    } else if (dateA.value && !dateB.value) {
      // Set B, ensure A is always the earlier date
      if (clickedDate < dateA.value) {
        dateB.value = dateA.value
        dateA.value = clickedDate
      } else if (clickedDate > dateA.value) {
        dateB.value = clickedDate
      }
      // Clicking same date as A — ignore
    } else {
      dateA.value = clickedDate
    }
  }

  const gradId = `area-grad-${color.replace('#', '')}`
  const h = hovered.value
  const tx = tooltipX.value
  const ty = tooltipY.value

  // Pinned marker renderer
  function PinMarker({ idx, label, markerColor }: { idx: number; label: string; markerColor: string }) {
    if (idx < 0) return null
    const { x, y } = ptToXY(idx, points[idx].price, points.length, yMin, yMax)
    return (
      <g>
        <line x1={x} y1={PAD.top} x2={x} y2={PAD.top + INNER_H} stroke={markerColor} stroke-width="1.5" opacity="0.5" />
        <circle cx={x} cy={y} r="6" fill={markerColor} stroke="#fff" stroke-width="2" />
        <rect x={x - 16} y={PAD.top - 2} width="32" height="14" rx="4" fill={markerColor} />
        <text x={x} y={PAD.top + 9} text-anchor="middle" font-size="8" font-weight="700" font-family="Fira Sans, sans-serif" fill="#fff">{label}</text>
      </g>
    )
  }

  // Shaded region between A and B
  function ShadedRegion() {
    if (idxA < 0 || idxB < 0) return null
    const left = Math.min(idxA, idxB)
    const right = Math.max(idxA, idxB)
    const x1 = PAD.left + (left / (points.length - 1)) * INNER_W
    const x2 = PAD.left + (right / (points.length - 1)) * INNER_W
    return (
      <rect x={x1} y={PAD.top} width={x2 - x1} height={INNER_H} fill={color} opacity="0.07" rx="4" />
    )
  }

  return (
    <div class="chart-wrap" role="img" aria-label="Fuel price chart — click to select dates for comparison">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style="display:block;overflow:visible;cursor:pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { hovered.value = null; hoveredIdx.value = -1 }}
        onClick={handleClick}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color={color} stop-opacity="0.25" />
            <stop offset="100%" stop-color={color} stop-opacity="0.02" />
          </linearGradient>
        </defs>

        {/* Y-axis grid + labels */}
        {ticks.map(tick => {
          const range = yMax - yMin || 1
          const y = PAD.top + (1 - (tick - yMin) / range) * INNER_H
          return (
            <g key={tick}>
              <line x1={PAD.left} y1={y} x2={PAD.left + INNER_W} y2={y} stroke="#E0E7FF" stroke-width="1" stroke-dasharray="4 3" />
              <text x={PAD.left - 6} y={y + 4} text-anchor="end" font-size="9" font-family="Fira Code, monospace" fill="#818CF8">{tick.toFixed(2)}</text>
            </g>
          )
        })}

        {/* X-axis labels */}
        {xLabelIdxs.map(idx => {
          const x = PAD.left + (idx / (points.length - 1)) * INNER_W
          return (
            <text key={idx} x={x} y={H - 4} text-anchor="middle" font-size="9" font-family="Fira Sans, sans-serif" fill="#818CF8">{monthLabel(points[idx].date)}</text>
          )
        })}

        {/* Shaded region between pins */}
        <ShadedRegion />

        {/* Area + line */}
        <path d={area} fill={`url(#${gradId})`} />
        <path d={line} fill="none" stroke={color} stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

        {/* Pinned markers */}
        <PinMarker idx={idxA} label="A" markerColor="#F97316" />
        <PinMarker idx={idxB} label="B" markerColor="#10b981" />

        {/* Hover crosshair + dot (only when not overlapping a pin) */}
        {h && hoveredIdx.value !== idxA && hoveredIdx.value !== idxB && (
          <g>
            <line x1={tx} y1={PAD.top} x2={tx} y2={PAD.top + INNER_H} stroke={color} stroke-width="1.5" stroke-dasharray="4 3" opacity="0.4" />
            <circle cx={tx} cy={ty} r="5" fill="#fff" stroke={color} stroke-width="2.5" />
          </g>
        )}

        {/* Tooltip */}
        {h && (() => {
          const bw = 88
          const bh = 36
          const bx = tx + 10 + bw > W ? tx - bw - 10 : tx + 10
          const by = Math.max(PAD.top, ty - bh / 2)
          return (
            <g>
              <rect x={bx} y={by} width={bw} height={bh} rx="8" ry="8" fill="#1E1B4B" stroke={color} stroke-width="1.5" />
              <text x={bx + bw / 2} y={by + 13} text-anchor="middle" font-size="8.5" font-family="Fira Sans, sans-serif" fill="#a5b4fc">{monthLabel(h.date)}</text>
              <text x={bx + bw / 2} y={by + 27} text-anchor="middle" font-size="11" font-family="Fira Code, monospace" font-weight="700" fill="#fff">THB {h.price.toFixed(2)}</text>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
