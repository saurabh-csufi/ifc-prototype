import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { TimeSeries, DatasetId } from '../../types';
import { getDatasetColor } from '../../utils/colors';
import { formatValue } from '../../utils/formatters';

interface BarChartProps {
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

const MARGIN = { top: 20, right: 24, bottom: 56, left: 65 };

export function BarChart({ series, width, height, unit, dataset }: BarChartProps) {
  const xAxisRef = useRef<SVGGElement>(null);
  const yAxisRef = useRef<SVGGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  // Determine grouping strategy:
  // If multiple series: group by series label, bars = dates within each
  // If single series with multiple obs: bars = dates
  const multiSeries = series.length > 1;

  // Collect all unique dates
  const allDates = Array.from(
    new Set(series.flatMap(s => s.observations.map(o => o.date)))
  ).sort();

  let groups: { category: string; bars: { label: string; value: number; color: string; date: string }[] }[];

  if (multiSeries) {
    // Group by category (series label), each category shows latest value or grouped by date
    // If few dates, group by date with bars per series
    groups = allDates.map(date => ({
      category: date,
      bars: series.map((s, si) => {
        const obs = s.observations.find(o => o.date === date);
        return {
          label: s.label || s.statVar,
          value: obs?.value ?? 0,
          color: getDatasetColor(dataset, si),
          date,
        };
      }),
    }));

    // If too many date groups, just use the latest date
    if (groups.length > 6) {
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
    }
  } else {
    // Single series: each date is a bar
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

  const x0Scale = d3.scaleBand()
    .domain(categories)
    .range([0, innerWidth])
    .padding(0.2);

  const x1Scale = d3.scaleBand()
    .domain(d3.range(maxBarsPerGroup).map(String))
    .range([0, x0Scale.bandwidth()])
    .padding(0.08);

  const allBarValues = groups.flatMap(g => g.bars.map(b => b.value));
  const yMax = (d3.max(allBarValues) || 0) * 1.15;

  const yScale = d3.scaleLinear()
    .domain([0, yMax])
    .nice()
    .range([innerHeight, 0]);

  useEffect(() => {
    if (xAxisRef.current) {
      const xAxis = d3.axisBottom(x0Scale);
      const g = d3.select(xAxisRef.current).call(xAxis);
      g.select('.domain').attr('stroke', '#cbd5e1');
      g.selectAll('.tick line').attr('stroke', 'transparent');
      g.selectAll('text')
        .style('font-size', '9px')
        .style('fill', '#64748b')
        .attr('transform', categories.length > 4 ? 'rotate(-35)' : '')
        .attr('dy', categories.length > 4 ? '0.5em' : '0.71em')
        .style('text-anchor', categories.length > 4 ? 'end' : 'middle');
    }
    if (yAxisRef.current) {
      const yAxis = d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(d => formatValue(d as number, unit));
      const g = d3.select(yAxisRef.current).call(yAxis);
      g.select('.domain').attr('stroke', 'transparent');
      g.selectAll('.tick line').attr('stroke', '#f1f5f9').attr('stroke-dasharray', '2,2');
      g.selectAll('text').style('font-size', '9px').style('fill', '#64748b');
    }
  }, [x0Scale, yScale, categories.length, unit]);

  return (
    <div className="bar-chart-wrapper">
      {/* Legend for multi-series */}
      {multiSeries && series.length <= 6 && (
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

          {/* Bar groups */}
          {groups.map((group, gi) => (
            <g key={gi} transform={`translate(${x0Scale(group.category) || 0},0)`}>
              {group.bars.map((bar, bi) => {
                const barHeight = Math.max(0, innerHeight - yScale(bar.value));
                return (
                  <g key={bi}>
                    <rect
                      x={x1Scale(String(bi)) || 0}
                      y={yScale(bar.value)}
                      width={x1Scale.bandwidth()}
                      height={barHeight}
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
                      onMouseLeave={() => setTooltip(null)}
                    />
                    {/* Value label on top of bar */}
                    {barHeight > 15 && (
                      <text
                        x={(x1Scale(String(bi)) || 0) + x1Scale.bandwidth() / 2}
                        y={yScale(bar.value) - 4}
                        textAnchor="middle"
                        fontSize={8}
                        fill="#475569"
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

          {/* Axes */}
          <g ref={xAxisRef} transform={`translate(0,${innerHeight})`} className="axis x-axis" />
          <g ref={yAxisRef} className="axis y-axis" />

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
