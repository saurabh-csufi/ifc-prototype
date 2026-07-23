import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { TimeSeries, DatasetId } from '../../types';
import { getDatasetColor } from '../../utils/colors';
import { formatValue } from '../../utils/formatters';

interface DumbbellChartProps {
  series: TimeSeries[];
  width: number;
  height: number;
  unit?: string;
  dataset: DatasetId;
}

const MARGIN = { top: 20, right: 50, bottom: 36, left: 110 };

export function DumbbellChart({ series, width, height, unit, dataset }: DumbbellChartProps) {
  const xAxisRef = useRef<SVGGElement>(null);

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  // For dumbbell, we compare earliest vs latest observation per series
  // Each series becomes a row (category)
  const rows = series.map((s, i) => {
    const sorted = [...s.observations].sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    return {
      label: s.label || s.statVar,
      startValue: first?.value ?? 0,
      endValue: last?.value ?? 0,
      startDate: first?.date ?? '',
      endDate: last?.date ?? '',
      color: getDatasetColor(dataset, i),
    };
  });

  if (rows.length === 0) return null;

  // Get unique date labels for legend
  const startDate = rows[0]?.startDate ?? '';
  const endDate = rows[0]?.endDate ?? '';

  const allValues = rows.flatMap(r => [r.startValue, r.endValue]);
  const xMin = Math.min(0, d3.min(allValues) || 0);
  const xMax = (d3.max(allValues) || 0) * 1.15;

  const xScale = d3.scaleLinear()
    .domain([xMin, xMax])
    .range([0, innerWidth]);

  const yScale = d3.scaleBand()
    .domain(rows.map(r => r.label))
    .range([0, innerHeight])
    .padding(0.4);

  useEffect(() => {
    if (xAxisRef.current) {
      const xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d => formatValue(d as number, unit));
      d3.select(xAxisRef.current).call(xAxis);
    }
  }, [xScale, unit]);

  const primaryColor = getDatasetColor(dataset, 0);
  const secondaryColor = getDatasetColor(dataset, 1);

  return (
    <div className="dumbbell-chart-wrapper">
      {/* Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: primaryColor }} />
          <span className="legend-label">{startDate}</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: secondaryColor }} />
          <span className="legend-label">{endDate}</span>
        </div>
      </div>

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

          {/* Rows */}
          {rows.map((row, i) => {
            const cy = (yScale(row.label) || 0) + yScale.bandwidth() / 2;

            return (
              <g key={i}>
                {/* Category label */}
                <text
                  x={-8}
                  y={cy}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={9}
                  fill="#475569"
                >
                  {row.label.length > 20 ? row.label.slice(0, 18) + '…' : row.label}
                </text>

                {/* Connecting line */}
                <line
                  x1={xScale(row.startValue)}
                  x2={xScale(row.endValue)}
                  y1={cy}
                  y2={cy}
                  stroke={secondaryColor}
                  strokeWidth={2}
                />

                {/* Start dot */}
                <circle
                  cx={xScale(row.startValue)}
                  cy={cy}
                  r={6}
                  fill={primaryColor}
                />

                {/* End dot */}
                <circle
                  cx={xScale(row.endValue)}
                  cy={cy}
                  r={6}
                  fill={secondaryColor}
                />

                {/* Value labels */}
                <text
                  x={xScale(row.startValue) - 10}
                  y={cy - 12}
                  textAnchor="end"
                  fontSize={9}
                  fill="#64748b"
                >
                  {formatValue(row.startValue, unit)}
                </text>
                <text
                  x={xScale(row.endValue) + 10}
                  y={cy - 12}
                  textAnchor="start"
                  fontSize={9}
                  fill="#64748b"
                >
                  {formatValue(row.endValue, unit)}
                </text>
              </g>
            );
          })}

          {/* X axis */}
          <g ref={xAxisRef} transform={`translate(0,${innerHeight})`} className="axis x-axis" />
        </g>
      </svg>
    </div>
  );
}
