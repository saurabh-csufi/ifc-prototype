import { useState } from 'react';
import * as d3 from 'd3';
import type { TimeSeries, DatasetId } from '../../types';
import { getDatasetColor, getDatasetAccent } from '../../utils/colors';
import { formatValue } from '../../utils/formatters';

interface PieChartProps {
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

interface SliceData {
  label: string;
  value: number;
  color: string;
  index: number;
}

const MARGIN = { top: 20, right: 20, bottom: 20, left: 20 };

function buildSlices(
  series: TimeSeries[],
  dataset: DatasetId,
  selectedYears: Set<string> | null,
  selectedYear: string | null
): SliceData[] {
  // Single series → each observation (year) is a slice
  if (series.length === 1) {
    const s = series[0];
    const obs = [...s.observations].sort((a, b) => a.date.localeCompare(b.date));
    const filtered = selectedYears
      ? obs.filter(o => selectedYears.has(o.date))
      : obs;
    return filtered
      .map((o, i) => ({
        label: o.date,
        value: o.value,
        color: getDatasetColor(dataset, i),
        index: i,
      }))
      .filter(s => s.value > 0);
  }

  // Multiple series → use selected year's observation from each series (or latest)
  return series
    .map((s, i) => {
      const sorted = [...s.observations].sort((a, b) => a.date.localeCompare(b.date));
      const obs = selectedYear
        ? sorted.find(o => o.date === selectedYear) ?? sorted[sorted.length - 1]
        : sorted[sorted.length - 1];
      return {
        label: s.label || s.statVar,
        value: obs?.value ?? 0,
        color: getDatasetColor(dataset, i),
        index: i,
      };
    })
    .filter(s => s.value > 0);
}

export function PieChart({ series, width, height, unit, dataset }: PieChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [selectedYears, setSelectedYears] = useState<Set<string> | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  // Determine if this is a single-series (year-based) pie
  const isSingleSeries = series.length === 1;
  const allYears = isSingleSeries
    ? [...series[0].observations].sort((a, b) => a.date.localeCompare(b.date)).map(o => o.date)
    : [];

  // For multi-series: collect all unique years across series for year selector
  const isMultiSeries = series.length > 1;
  const multiSeriesYears = isMultiSeries
    ? Array.from(new Set(series.flatMap(s => s.observations.map(o => o.date)))).sort()
    : [];
  const hasYearSelector = isMultiSeries && multiSeriesYears.length > 1;

  const slices = buildSlices(series, dataset, selectedYears, selectedYear);

  if (slices.length === 0) {
    return <div className="pie-chart-wrapper">No data available</div>;
  }

  const total = d3.sum(slices, d => d.value);
  const needsYearBar = (isSingleSeries && allYears.length > 0) || hasYearSelector;
  const chartAreaHeight = needsYearBar
    ? innerHeight - 36  // leave room for year buttons
    : innerHeight;
  const radius = Math.min(innerWidth, chartAreaHeight) / 2;
  const innerRadius = radius * 0.42;
  const outerRadius = radius * 0.82;

  const pie = d3.pie<SliceData>()
    .value(d => d.value)
    .sort(null)
    .padAngle(0.02);

  const arc = d3.arc<d3.PieArcDatum<SliceData>>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .cornerRadius(3);

  const arcHover = d3.arc<d3.PieArcDatum<SliceData>>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius + 6)
    .cornerRadius(3);

  const labelArc = d3.arc<d3.PieArcDatum<SliceData>>()
    .innerRadius(outerRadius + 12)
    .outerRadius(outerRadius + 12);

  const arcs = pie(slices);

  const toggleYear = (year: string) => {
    setSelectedYears(prev => {
      const next = new Set(prev ?? allYears);
      if (next.has(year)) {
        next.delete(year);
        // Don't allow deselecting all
        if (next.size === 0) return prev;
      } else {
        next.add(year);
      }
      return next;
    });
  };

  const activeYears = selectedYears ?? new Set(allYears);

  return (
    <div className="pie-chart-wrapper">
      {/* Year selector buttons for single-series pie */}
      {isSingleSeries && allYears.length > 0 && (
        <div className="pie-year-selector">
          {allYears.map(year => {
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

      {/* Year selector for multi-series pie (pick one year) */}
      {hasYearSelector && (
        <div className="pie-year-selector">
          {multiSeriesYears.map(year => {
            const active = selectedYear ? year === selectedYear : year === multiSeriesYears[multiSeriesYears.length - 1];
            const accent = getDatasetAccent(dataset);
            return (
              <button
                key={year}
                className={`pie-year-btn ${active ? 'active' : ''}`}
                style={active ? { background: accent, borderColor: accent, color: '#fff' } : {}}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="chart-legend">
        {slices.map((s, i) => (
          <div key={i} className="legend-item">
            <span className="legend-swatch" style={{ backgroundColor: s.color }} />
            <span className="legend-label">{s.label}</span>
          </div>
        ))}
      </div>

      <svg width={width} height={height - (needsYearBar ? 36 : 0)}>
        <g transform={`translate(${MARGIN.left + innerWidth / 2},${MARGIN.top + chartAreaHeight / 2})`}>
          {arcs.map((d, i) => {
            const isActive = activeIdx === i;
            const percentage = (d.data.value / total) * 100;
            const centroid = labelArc.centroid(d);

            return (
              <g key={i}>
                <path
                  d={(isActive ? arcHover(d) : arc(d)) || ''}
                  fill={d.data.color}
                  fillOpacity={isActive ? 1 : 0.85}
                  stroke="#fff"
                  strokeWidth={2}
                  onMouseEnter={(e) => {
                    setActiveIdx(i);
                    setTooltip({
                      x: e.clientX,
                      y: e.clientY,
                      label: d.data.label,
                      value: d.data.value,
                      percentage,
                    });
                  }}
                  onMouseMove={(e) => {
                    setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
                  }}
                  onMouseLeave={() => {
                    setActiveIdx(null);
                    setTooltip(null);
                  }}
                  style={{ cursor: 'pointer', transition: 'd 0.15s ease' }}
                />
                {percentage > 6 && (
                  <text
                    x={centroid[0]}
                    y={centroid[1]}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={9}
                    fill="#475569"
                    fontWeight={500}
                  >
                    {percentage.toFixed(1)}%
                  </text>
                )}
              </g>
            );
          })}

          {/* Center total label */}
          <text textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="#94a3b8">
            Total
          </text>
          <text textAnchor="middle" dy={16} fontSize={13} fill="#334155" fontWeight={600}>
            {formatValue(total, unit)}
          </text>
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
