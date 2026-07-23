import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { TimeSeries, DatasetId } from '../../types';
import { getDatasetColor } from '../../utils/colors';
import { formatValue } from '../../utils/formatters';

interface HorizontalBarChartProps {
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

export function HorizontalBarChart({ series, width, height, unit, dataset }: HorizontalBarChartProps) {
  const xAxisRef = useRef<SVGGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  if (!series.length || series.every(s => s.observations.length === 0)) {
    return <div className="horizontal-bar-chart-wrapper">No data available</div>;
  }

  const multiSeries = series.length > 1;

  // Collect all unique dates
  const allDates = Array.from(
    new Set(series.flatMap(s => s.observations.map(o => o.date)))
  ).sort();

  // Build groups: for multi-series use latest date with grouped bars per series
  // For single series, each date is a category
  let groups: { category: string; bars: { label: string; value: number; color: string; date: string }[] }[];

  if (multiSeries) {
    // Use latest date, each series is a bar
    const latestDate = allDates[allDates.length - 1];
    groups = [{
      category: latestDate,
      bars: series.map((s, si) => {
        const obs = s.observations.find(o => o.date === latestDate);
        return {
          label: s.label || s.statVar,
          value: obs?.value ?? 0,
          color: getDatasetColor(dataset, si),
          date: latestDate,
        };
      }),
    }];

    // If few series, show each series as its own row for readability
    if (series.length <= 10) {
      groups = series.map((s, si) => {
        const sorted = [...s.observations].sort((a, b) => a.date.localeCompare(b.date));
        const latest = sorted[sorted.length - 1];
        return {
          category: s.label || s.statVar,
          bars: [{
            label: s.label || s.statVar,
            value: latest?.value ?? 0,
            color: getDatasetColor(dataset, si),
            date: latest?.date ?? '',
          }],
        };
      });
    }
  } else {
    const s = series[0];
    groups = s.observations.map((obs, i) => ({
      category: obs.date,
      bars: [{
        label: obs.date,
        value: obs.value,
        color: getDatasetColor(dataset, i % 2),
        date: obs.date,
      }],
    }));
  }

  const categories = groups.map(g => g.category);
  const maxBarsPerGroup = Math.max(...groups.map(g => g.bars.length), 1);

  const allBarValues = groups.flatMap(g => g.bars.map(b => b.value));
  const xMax = (d3.max(allBarValues) || 0) * 1.15;

  const xScale = d3.scaleLinear()
    .domain([0, xMax])
    .range([0, innerWidth]);

  const y0Scale = d3.scaleBand()
    .domain(categories)
    .range([0, innerHeight])
    .padding(0.2);

  const y1Scale = d3.scaleBand()
    .domain(d3.range(maxBarsPerGroup).map(String))
    .range([0, y0Scale.bandwidth()])
    .padding(0.08);

  useEffect(() => {
    if (xAxisRef.current) {
      const xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d => formatValue(d as number, unit));
      d3.select(xAxisRef.current).call(xAxis);
    }
  }, [xScale, unit]);

  return (
    <div className="horizontal-bar-chart-wrapper">
      {/* Legend for multi-series with grouped bars */}
      {multiSeries && maxBarsPerGroup > 1 && series.length <= 6 && (
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

          {/* Bar groups */}
          {groups.map((group, gi) => (
            <g key={gi} transform={`translate(0,${y0Scale(group.category) || 0})`}>
              {/* Category label */}
              <text
                x={-8}
                y={y0Scale.bandwidth() / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={11}
                fill="#475569"
              >
                {group.category}
              </text>

              {group.bars.map((bar, bi) => {
                const barWidth = Math.max(0, xScale(bar.value));
                const barY = y1Scale(String(bi)) || 0;

                return (
                  <g key={bi}>
                    <rect
                      x={0}
                      y={barY}
                      width={barWidth}
                      height={y1Scale.bandwidth()}
                      fill={bar.color}
                      rx={2}
                      onMouseEnter={(e) =>
                        setTooltip({
                          x: e.clientX,
                          y: e.clientY,
                          label: bar.label,
                          value: bar.value,
                          date: bar.date,
                        })
                      }
                      onMouseMove={(e) =>
                        setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)
                      }
                      onMouseLeave={() => setTooltip(null)}
                    />
                    {/* Value label */}
                    {barWidth > 20 && (
                      <text
                        x={barWidth + 6}
                        y={barY + y1Scale.bandwidth() / 2}
                        dominantBaseline="middle"
                        fontSize={9}
                        fill="#64748b"
                        fontWeight={500}
                      >
                        {formatValue(bar.value, unit)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          ))}

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
