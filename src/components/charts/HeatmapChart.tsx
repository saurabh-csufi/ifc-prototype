import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { TimeSeries, DatasetId } from '../../types';
import { getDatasetColor } from '../../utils/colors';
import { formatValue } from '../../utils/formatters';

interface HeatmapChartProps {
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

const MARGIN = { top: 30, right: 40, bottom: 50, left: 120 };

export function HeatmapChart({ series, width, height, unit, dataset }: HeatmapChartProps) {
  const xAxisRef = useRef<SVGGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  if (!series.length || series.every(s => s.observations.length === 0)) {
    return <div className="heatmap-chart-wrapper">No data available</div>;
  }

  // X axis = dates, Y axis = series labels
  const allDates = Array.from(
    new Set(series.flatMap(s => s.observations.map(o => o.date)))
  ).sort();

  const seriesLabels = series.map(s => s.label || s.statVar);

  const allValues = series.flatMap(s => s.observations.map(o => o.value));
  const valueMin = d3.min(allValues) ?? 0;
  const valueMax = d3.max(allValues) ?? 0;

  const xScale = d3.scaleBand()
    .domain(allDates)
    .range([0, innerWidth])
    .padding(0.05);

  const yScale = d3.scaleBand()
    .domain(seriesLabels)
    .range([0, innerHeight])
    .padding(0.05);

  // Color scale based on dataset primary color
  const baseColor = getDatasetColor(dataset, 0);
  const colorScale = d3.scaleSequential()
    .domain([valueMin, valueMax])
    .interpolator(d3.interpolate('#f1f5f9', baseColor));

  useEffect(() => {
    if (xAxisRef.current) {
      const xAxis = d3.axisBottom(xScale);
      const g = d3.select(xAxisRef.current).call(xAxis);
      g.selectAll('text')
        .style('font-size', '10px')
        .attr('transform', allDates.length > 6 ? 'rotate(-30)' : '')
        .style('text-anchor', allDates.length > 6 ? 'end' : 'middle');
    }
  }, [xScale, allDates.length]);

  // Build flat list of cells
  const cells = series.flatMap((s, si) => {
    const label = s.label || s.statVar;
    return s.observations.map(obs => ({
      label,
      date: obs.date,
      value: obs.value,
      seriesIndex: si,
    }));
  });

  // Legend gradient dimensions
  const legendWidth = Math.min(innerWidth, 200);
  const legendHeight = 10;

  return (
    <div className="heatmap-chart-wrapper">
      <svg width={width} height={height}>
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {/* Y axis labels (series names) */}
          {seriesLabels.map((label, i) => (
            <text
              key={i}
              x={-8}
              y={(yScale(label) || 0) + yScale.bandwidth() / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={11}
              fill="#475569"
            >
              {label.length > 18 ? label.slice(0, 18) + '...' : label}
            </text>
          ))}

          {/* Heat cells */}
          {cells.map((cell, i) => {
            const cellX = xScale(cell.date);
            const cellY = yScale(cell.label);
            if (cellX === undefined || cellY === undefined) return null;

            return (
              <rect
                key={i}
                x={cellX}
                y={cellY}
                width={xScale.bandwidth()}
                height={yScale.bandwidth()}
                fill={colorScale(cell.value)}
                rx={2}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) =>
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    label: cell.label,
                    value: cell.value,
                    date: cell.date,
                  })
                }
                onMouseMove={(e) =>
                  setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)
                }
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}

          {/* Value text in cells if they are large enough */}
          {cells.map((cell, i) => {
            const cellX = xScale(cell.date);
            const cellY = yScale(cell.label);
            if (cellX === undefined || cellY === undefined) return null;
            if (xScale.bandwidth() < 35 || yScale.bandwidth() < 20) return null;

            return (
              <text
                key={`t-${i}`}
                x={cellX + xScale.bandwidth() / 2}
                y={cellY + yScale.bandwidth() / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={9}
                fill={cell.value > (valueMin + valueMax) / 2 ? '#fff' : '#334155'}
                fontWeight={500}
                pointerEvents="none"
              >
                {formatValue(cell.value, unit)}
              </text>
            );
          })}

          {/* X axis */}
          <g ref={xAxisRef} transform={`translate(0,${innerHeight})`} className="axis x-axis" />

          {/* Color legend */}
          <defs>
            <linearGradient id={`heatmap-gradient-${dataset}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor={baseColor} />
            </linearGradient>
          </defs>
          <g transform={`translate(${(innerWidth - legendWidth) / 2},${innerHeight + 32})`}>
            <rect
              width={legendWidth}
              height={legendHeight}
              fill={`url(#heatmap-gradient-${dataset})`}
              rx={2}
            />
            <text x={0} y={legendHeight + 12} fontSize={9} fill="#64748b">
              {formatValue(valueMin, unit)}
            </text>
            <text x={legendWidth} y={legendHeight + 12} fontSize={9} fill="#64748b" textAnchor="end">
              {formatValue(valueMax, unit)}
            </text>
          </g>
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
