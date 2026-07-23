import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { TimeSeries, DatasetId } from '../../types';
import { getDatasetColor, getDatasetAccent } from '../../utils/colors';
import { formatValue, formatDate } from '../../utils/formatters';

interface ScatterChartProps {
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

const MARGIN = { top: 30, right: 20, bottom: 50, left: 60 };

export function ScatterChart({ series, width, height, unit, dataset }: ScatterChartProps) {
  const xAxisRef = useRef<SVGGElement>(null);
  const yAxisRef = useRef<SVGGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [selectedYears, setSelectedYears] = useState<Set<string> | null>(null);

  const innerWidth = width - MARGIN.left - MARGIN.right;

  if (!series.length || series.every(s => s.observations.length === 0)) {
    return <div className="scatter-chart-wrapper">No data available</div>;
  }

  const allDates = Array.from(
    new Set(series.flatMap(s => s.observations.map(o => o.date)))
  ).sort();

  // Year toggle support
  const showYearToggle = allDates.length > 1;
  const activeYears = selectedYears ?? new Set(allDates);

  const toggleYear = (year: string) => {
    setSelectedYears(prev => {
      const next = new Set(prev ?? allDates);
      if (next.has(year)) {
        next.delete(year);
        if (next.size === 0) return prev;
      } else {
        next.add(year);
      }
      return next;
    });
  };

  // Filter series observations to selected years
  const filteredSeries = series.map(s => ({
    ...s,
    observations: s.observations.filter(o => activeYears.has(o.date)),
  }));

  const filteredDates = allDates.filter(d => activeYears.has(d));
  const innerHeight = height - MARGIN.top - MARGIN.bottom - (showYearToggle ? 36 : 0);

  const allValues = filteredSeries.flatMap(s => s.observations.map(o => o.value));
  const dataMin = d3.min(allValues) ?? 0;
  const dataMax = d3.max(allValues) ?? 0;
  const range = dataMax - dataMin;
  const yMin = dataMin > 0 && dataMin > range * 0.3 ? dataMin - range * 0.15 : 0;
  const yMax = dataMax + range * 0.15;

  const xScale = d3.scalePoint<string>()
    .domain(filteredDates)
    .range([0, innerWidth])
    .padding(0.3);

  const yScale = d3.scaleLinear()
    .domain([yMin, yMax || 1])
    .nice()
    .range([innerHeight, 0]);

  useEffect(() => {
    if (xAxisRef.current) {
      const xAxis = d3.axisBottom(xScale);
      const g = d3.select(xAxisRef.current).call(xAxis);
      g.selectAll('text')
        .style('font-size', '10px')
        .attr('transform', filteredDates.length > 6 ? 'rotate(-30)' : '')
        .style('text-anchor', filteredDates.length > 6 ? 'end' : 'middle');
    }
    if (yAxisRef.current) {
      const yAxis = d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(d => formatValue(d as number, unit));
      d3.select(yAxisRef.current).call(yAxis);
    }
  }, [xScale, yScale, filteredDates.length, unit]);

  return (
    <div className="scatter-chart-wrapper">
      {/* Year toggle buttons */}
      {showYearToggle && (
        <div className="pie-year-selector">
          {allDates.map(year => {
            const isActive = activeYears.has(year);
            const accent = getDatasetAccent(dataset);
            return (
              <button
                key={year}
                className={`pie-year-btn ${isActive ? 'active' : ''}`}
                style={isActive ? { background: accent, borderColor: accent, color: '#fff' } : {}}
                onClick={() => toggleYear(year)}
              >
                {year}
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      {filteredSeries.length > 1 && (
        <div className="chart-legend">
          {filteredSeries.map((s, i) => (
            <div key={i} className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: getDatasetColor(dataset, i) }} />
              <span className="legend-label">{s.label || s.statVar}</span>
            </div>
          ))}
        </div>
      )}

      <svg width={width} height={height - (showYearToggle ? 36 : 0)}>
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

          {/* Scatter dots per series */}
          {filteredSeries.map((s, si) => {
            const color = getDatasetColor(dataset, si);
            return s.observations.map((obs, oi) => (
              <circle
                key={`${si}-${oi}`}
                cx={xScale(obs.date) || 0}
                cy={yScale(obs.value)}
                r={6}
                fill={color}
                fillOpacity={0.7}
                stroke={color}
                strokeWidth={1.5}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) =>
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    label: s.label || s.statVar,
                    value: obs.value,
                    date: obs.date,
                  })
                }
                onMouseMove={(e) =>
                  setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)
                }
                onMouseLeave={() => setTooltip(null)}
              />
            ));
          })}

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
          <div className="tooltip-date">{formatDate(tooltip.date)}</div>
          <div className="tooltip-row">
            <span className="tooltip-label">{tooltip.label}: </span>
            <span className="tooltip-value">{formatValue(tooltip.value, unit)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
