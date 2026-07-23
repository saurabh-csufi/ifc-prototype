import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { TimeSeries, DatasetId } from '../../types';
import { getDatasetColor } from '../../utils/colors';
import { formatValue } from '../../utils/formatters';

interface ButterflyChartProps {
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
  side: string;
}

const MARGIN = { top: 30, right: 60, bottom: 30, left: 60 };

export function ButterflyChart({ series, width, height, unit, dataset }: ButterflyChartProps) {
  const leftAxisRef = useRef<SVGGElement>(null);
  const rightAxisRef = useRef<SVGGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;
  const midX = innerWidth / 2;

  // Use first two series as left and right
  const leftSeries = series[0];
  const rightSeries = series[1] || series[0];

  // Use latest observations for each
  const leftObs = leftSeries ? [...leftSeries.observations].sort((a, b) => b.date.localeCompare(a.date)) : [];
  const rightObs = rightSeries ? [...rightSeries.observations].sort((a, b) => b.date.localeCompare(a.date)) : [];

  // Build categories from dates
  const allDates = Array.from(new Set([
    ...leftObs.map(o => o.date),
    ...rightObs.map(o => o.date),
  ])).sort();

  const categories = allDates;

  const leftValues = categories.map(d => leftObs.find(o => o.date === d)?.value ?? 0);
  const rightValues = categories.map(d => rightObs.find(o => o.date === d)?.value ?? 0);

  const maxVal = Math.max(
    d3.max(leftValues) || 0,
    d3.max(rightValues) || 0
  ) * 1.15;

  const yScale = d3.scaleBand()
    .domain(categories)
    .range([0, innerHeight])
    .padding(0.25);

  const xLeftScale = d3.scaleLinear()
    .domain([0, maxVal])
    .range([midX - 10, 0]);

  const xRightScale = d3.scaleLinear()
    .domain([0, maxVal])
    .range([midX + 10, innerWidth]);

  const leftColor = getDatasetColor(dataset, 0);
  const rightColor = getDatasetColor(dataset, 1);

  useEffect(() => {
    if (leftAxisRef.current) {
      const axis = d3.axisBottom(xLeftScale).ticks(4).tickFormat(d => formatValue(d as number, unit));
      d3.select(leftAxisRef.current).call(axis);
    }
    if (rightAxisRef.current) {
      const axis = d3.axisBottom(xRightScale).ticks(4).tickFormat(d => formatValue(d as number, unit));
      d3.select(rightAxisRef.current).call(axis);
    }
  }, [xLeftScale, xRightScale, unit]);

  if (series.length === 0) return null;

  return (
    <div className="butterfly-chart-wrapper">
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-swatch" style={{ backgroundColor: leftColor }} />
          <span className="legend-label">{leftSeries?.label || leftSeries?.statVar || 'Left'}</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch" style={{ backgroundColor: rightColor }} />
          <span className="legend-label">{rightSeries?.label || rightSeries?.statVar || 'Right'}</span>
        </div>
      </div>

      <svg width={width} height={height}>
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {/* Center line */}
          <line x1={midX} x2={midX} y1={0} y2={innerHeight} stroke="#cbd5e1" strokeWidth={1} />

          {/* Grid lines */}
          {xLeftScale.ticks(4).map((tick, i) => (
            <line key={`lg-${i}`} x1={xLeftScale(tick)} x2={xLeftScale(tick)} y1={0} y2={innerHeight} stroke="#f1f5f9" strokeDasharray="2,2" />
          ))}
          {xRightScale.ticks(4).map((tick, i) => (
            <line key={`rg-${i}`} x1={xRightScale(tick)} x2={xRightScale(tick)} y1={0} y2={innerHeight} stroke="#f1f5f9" strokeDasharray="2,2" />
          ))}

          {/* Category labels in center */}
          {categories.map((cat) => (
            <text
              key={cat}
              x={midX}
              y={(yScale(cat) || 0) + yScale.bandwidth() / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9}
              fill="#475569"
              fontWeight={500}
            >
              {cat}
            </text>
          ))}

          {/* Left bars */}
          {categories.map((cat, i) => {
            const val = leftValues[i];
            const barWidth = Math.abs(xLeftScale(0) - xLeftScale(val));
            return (
              <rect
                key={`l-${i}`}
                x={xLeftScale(val)}
                y={yScale(cat) || 0}
                width={barWidth}
                height={yScale.bandwidth()}
                fill={leftColor}
                rx={2}
                onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, label: leftSeries?.label || '', value: val, side: 'left' })}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}

          {/* Right bars */}
          {categories.map((cat, i) => {
            const val = rightValues[i];
            return (
              <rect
                key={`r-${i}`}
                x={midX + 10}
                y={yScale(cat) || 0}
                width={Math.abs(xRightScale(val) - xRightScale(0))}
                height={yScale.bandwidth()}
                fill={rightColor}
                rx={2}
                onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, label: rightSeries?.label || '', value: val, side: 'right' })}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}

          {/* Axes */}
          <g ref={leftAxisRef} transform={`translate(0,${innerHeight})`} className="axis x-axis" />
          <g ref={rightAxisRef} transform={`translate(0,${innerHeight})`} className="axis x-axis" />
        </g>
      </svg>

      {tooltip && (
        <div className="chart-tooltip" style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}>
          <div className="tooltip-label">{tooltip.label}</div>
          <div className="tooltip-value">{formatValue(tooltip.value, unit)}</div>
        </div>
      )}
    </div>
  );
}
