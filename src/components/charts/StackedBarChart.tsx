import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { TimeSeries, DatasetId } from '../../types';
import { getDatasetColor } from '../../utils/colors';
import { formatValue } from '../../utils/formatters';

interface StackedBarChartProps {
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
  total: number;
}

const MARGIN = { top: 30, right: 20, bottom: 50, left: 60 };

export function StackedBarChart({ series, width, height, unit, dataset }: StackedBarChartProps) {
  const xAxisRef = useRef<SVGGElement>(null);
  const yAxisRef = useRef<SVGGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  if (!series.length || series.every(s => s.observations.length === 0)) {
    return <div className="stacked-bar-chart-wrapper">No data available</div>;
  }

  // Collect all unique dates
  const allDates = Array.from(
    new Set(series.flatMap(s => s.observations.map(o => o.date)))
  ).sort();

  // Build stacked data: for each date, compute cumulative y values
  const stackedData = allDates.map(date => {
    let cumulative = 0;
    const segments = series.map((s, si) => {
      const obs = s.observations.find(o => o.date === date);
      const value = obs?.value ?? 0;
      const y0 = cumulative;
      cumulative += value;
      return {
        label: s.label || s.statVar,
        value,
        y0,
        y1: cumulative,
        color: getDatasetColor(dataset, si),
        date,
      };
    });
    return { date, segments, total: cumulative };
  });

  const xScale = d3.scaleBand()
    .domain(allDates)
    .range([0, innerWidth])
    .padding(0.25);

  const yMax = (d3.max(stackedData, d => d.total) || 0) * 1.1;

  const yScale = d3.scaleLinear()
    .domain([0, yMax])
    .nice()
    .range([innerHeight, 0]);

  useEffect(() => {
    if (xAxisRef.current) {
      const xAxis = d3.axisBottom(xScale);
      const g = d3.select(xAxisRef.current).call(xAxis);
      g.selectAll('text')
        .style('font-size', '10px')
        .attr('transform', allDates.length > 4 ? 'rotate(-30)' : '')
        .style('text-anchor', allDates.length > 4 ? 'end' : 'middle');
    }
    if (yAxisRef.current) {
      const yAxis = d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(d => formatValue(d as number, unit));
      d3.select(yAxisRef.current).call(yAxis);
    }
  }, [xScale, yScale, allDates.length, unit]);

  return (
    <div className="stacked-bar-chart-wrapper">
      {/* Legend */}
      {series.length > 1 && series.length <= 8 && (
        <div className="chart-legend">
          {series.map((s, i) => (
            <div key={i} className="legend-item">
              <span className="legend-swatch" style={{ backgroundColor: getDatasetColor(dataset, i) }} />
              <span className="legend-label">{s.label || s.statVar}</span>
            </div>
          ))}
        </div>
      )}

      <svg width={width} height={height}>
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {/* Grid lines */}
          {yScale.ticks(5).map((tick, i) => (
            <line
              key={i}
              x1={0}
              x2={innerWidth}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke="#f1f5f9"
              strokeDasharray="2,2"
            />
          ))}

          {/* Stacked bars */}
          {stackedData.map((group, gi) => (
            <g key={gi} transform={`translate(${xScale(group.date) || 0},0)`}>
              {group.segments.map((seg, si) => {
                const segHeight = Math.max(0, yScale(seg.y0) - yScale(seg.y1));
                return (
                  <rect
                    key={si}
                    x={0}
                    y={yScale(seg.y1)}
                    width={xScale.bandwidth()}
                    height={segHeight}
                    fill={seg.color}
                    rx={si === group.segments.length - 1 ? 2 : 0}
                    onMouseEnter={(e) =>
                      setTooltip({
                        x: e.clientX,
                        y: e.clientY,
                        label: seg.label,
                        value: seg.value,
                        date: seg.date,
                        total: group.total,
                      })
                    }
                    onMouseMove={(e) =>
                      setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)
                    }
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}

              {/* Total label on top */}
              <text
                x={xScale.bandwidth() / 2}
                y={yScale(group.total) - 4}
                textAnchor="middle"
                fontSize={8}
                fill="#475569"
                fontWeight={500}
              >
                {formatValue(group.total, unit)}
              </text>
            </g>
          ))}

          {/* Axes */}
          <g ref={xAxisRef} transform={`translate(0,${innerHeight})`} className="axis x-axis" />
          <g ref={yAxisRef} className="axis y-axis" />

          {/* X axis label */}
          <text
            x={innerWidth / 2}
            y={innerHeight + 42}
            textAnchor="middle"
            fontSize={11}
            fill="#64748b"
          >
            Year
          </text>
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
          <div className="tooltip-row" style={{ borderTop: '1px solid #e2e8f0', paddingTop: 2, marginTop: 2 }}>
            <span className="tooltip-label">Total: </span>
            <span className="tooltip-value">{formatValue(tooltip.total, unit)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
