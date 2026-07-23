import { useState } from 'react';
import * as d3 from 'd3';
import type { TimeSeries, DatasetId } from '../../types';
import { getDatasetColor } from '../../utils/colors';
import { formatValue } from '../../utils/formatters';

interface TreemapChartProps {
  series: TimeSeries[];
  width: number;
  height: number;
  unit?: string;
  dataset: DatasetId;
}

interface TooltipState {
  x: number;
  y: number;
  label: string;
  value: number;
  percentage: number;
}

const MARGIN = { top: 10, right: 10, bottom: 10, left: 10 };

export function TreemapChart({ series, width, height, unit, dataset }: TreemapChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  // Use latest observation from each series as tiles
  const tiles = series
    .map((s, i) => {
      const sorted = [...s.observations].sort((a, b) => a.date.localeCompare(b.date));
      const latest = sorted[sorted.length - 1];
      return {
        label: s.label || s.statVar,
        value: latest?.value ?? 0,
        color: getDatasetColor(dataset, i),
      };
    })
    .filter(t => t.value > 0);

  if (tiles.length === 0) {
    return <div className="treemap-chart-wrapper">No data available</div>;
  }

  const total = d3.sum(tiles, d => d.value);

  // Build hierarchy for d3.treemap
  const root = d3.hierarchy({ children: tiles } as any)
    .sum((d: any) => d.value)
    .sort((a, b) => (b.value || 0) - (a.value || 0));

  d3.treemap<any>()
    .size([innerWidth, innerHeight])
    .padding(3)
    .round(true)(root);

  const leaves = root.leaves();

  return (
    <div className="treemap-chart-wrapper">
      <svg width={width} height={height}>
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {leaves.map((leaf, i) => {
            const d = leaf.data as typeof tiles[0];
            const x0 = (leaf as any).x0 as number;
            const y0 = (leaf as any).y0 as number;
            const x1 = (leaf as any).x1 as number;
            const y1 = (leaf as any).y1 as number;
            const tileW = x1 - x0;
            const tileH = y1 - y0;
            const percentage = (d.value / total) * 100;
            const isActive = activeLabel === d.label;

            return (
              <g key={i}>
                <rect
                  x={x0}
                  y={y0}
                  width={tileW}
                  height={tileH}
                  fill={d.color}
                  fillOpacity={isActive ? 1 : 0.8}
                  stroke="#fff"
                  strokeWidth={2}
                  rx={3}
                  style={{ cursor: 'pointer', transition: 'fill-opacity 0.15s ease' }}
                  onMouseEnter={(e) => {
                    setActiveLabel(d.label);
                    setTooltip({
                      x: e.clientX,
                      y: e.clientY,
                      label: d.label,
                      value: d.value,
                      percentage,
                    });
                  }}
                  onMouseMove={(e) =>
                    setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)
                  }
                  onMouseLeave={() => {
                    setActiveLabel(null);
                    setTooltip(null);
                  }}
                />
                {/* Label text - only show if tile is large enough */}
                {tileW > 40 && tileH > 28 && (
                  <>
                    <text
                      x={x0 + 6}
                      y={y0 + 16}
                      fontSize={tileW > 80 ? 11 : 9}
                      fill="#fff"
                      fontWeight={600}
                      pointerEvents="none"
                    >
                      {d.label.length > Math.floor(tileW / 7)
                        ? d.label.slice(0, Math.floor(tileW / 7)) + '...'
                        : d.label}
                    </text>
                    {tileH > 44 && (
                      <text
                        x={x0 + 6}
                        y={y0 + 32}
                        fontSize={10}
                        fill="rgba(255,255,255,0.85)"
                        pointerEvents="none"
                      >
                        {formatValue(d.value, unit)}
                      </text>
                    )}
                  </>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="chart-tooltip"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <div className="tooltip-label" style={{ fontWeight: 600 }}>{tooltip.label}</div>
          <div className="tooltip-row">
            <span className="tooltip-value">{formatValue(tooltip.value, unit)}</span>
            <span style={{ color: '#64748b', marginLeft: 6, fontSize: 11 }}>
              ({tooltip.percentage.toFixed(1)}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
