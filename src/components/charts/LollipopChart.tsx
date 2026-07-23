import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { TimeSeries, DatasetId } from '../../types';
import { getDatasetColor } from '../../utils/colors';
import { formatValue } from '../../utils/formatters';

interface LollipopChartProps {
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
  date: string;
}

const MARGIN = { top: 30, right: 60, bottom: 30, left: 120 };

export function LollipopChart({ series, width, height, unit, dataset }: LollipopChartProps) {
  const xAxisRef = useRef<SVGGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  if (!series.length || series.every(s => s.observations.length === 0)) {
    return <div className="lollipop-chart-wrapper">No data available</div>;
  }

  // Use latest observation from each series as a lollipop row
  const rows = series.map((s, i) => {
    const sorted = [...s.observations].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1];
    return {
      label: s.label || s.statVar,
      value: latest?.value ?? 0,
      date: latest?.date ?? '',
      color: getDatasetColor(dataset, i),
    };
  });

  const categories = rows.map(r => r.label);
  const xMax = (d3.max(rows, r => r.value) || 0) * 1.15;

  const xScale = d3.scaleLinear()
    .domain([0, xMax])
    .range([0, innerWidth]);

  const yScale = d3.scaleBand()
    .domain(categories)
    .range([0, innerHeight])
    .padding(0.35);

  useEffect(() => {
    if (xAxisRef.current) {
      const xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d => formatValue(d as number, unit));
      d3.select(xAxisRef.current).call(xAxis);
    }
  }, [xScale, unit]);

  return (
    <div className="lollipop-chart-wrapper">
      <svg width={width} height={height}>
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {/* Grid lines */}
          {xScale.ticks(5).map((tick, i) => (
            <line
              key={i}
              x1={xScale(tick)}
              x2={xScale(tick)}
              y1={0}
              y2={innerHeight}
              stroke="#f1f5f9"
              strokeDasharray="2,2"
            />
          ))}

          {/* Lollipop rows */}
          {rows.map((row, i) => {
            const cy = (yScale(row.label) || 0) + yScale.bandwidth() / 2;
            const cx = xScale(row.value);

            return (
              <g key={i}>
                {/* Category label */}
                <text
                  x={-8}
                  y={cy}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={11}
                  fill="#475569"
                >
                  {row.label}
                </text>

                {/* Stick (line) */}
                <line
                  x1={0}
                  x2={cx}
                  y1={cy}
                  y2={cy}
                  stroke={row.color}
                  strokeWidth={2}
                />

                {/* Pop (circle) */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={7}
                  fill={row.color}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) =>
                    setTooltip({
                      x: e.clientX,
                      y: e.clientY,
                      label: row.label,
                      value: row.value,
                      date: row.date,
                    })
                  }
                  onMouseMove={(e) =>
                    setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)
                  }
                  onMouseLeave={() => setTooltip(null)}
                />

                {/* Value label */}
                <text
                  x={cx + 14}
                  y={cy}
                  dominantBaseline="middle"
                  fontSize={10}
                  fill="#64748b"
                  fontWeight={500}
                >
                  {formatValue(row.value, unit)}
                </text>
              </g>
            );
          })}

          {/* X axis */}
          <g ref={xAxisRef} transform={`translate(0,${innerHeight})`} className="axis x-axis" />
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="chart-tooltip"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <div className="tooltip-date">{tooltip.date}</div>
          <div className="tooltip-row">
            <span className="tooltip-label">{tooltip.label}: </span>
            <span className="tooltip-value">{formatValue(tooltip.value, unit)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
