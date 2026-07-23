import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { TimeSeries, DatasetId } from '../../types';
import { getDatasetColor } from '../../utils/colors';
import { formatValue, formatDate } from '../../utils/formatters';

interface SlopeChartProps {
  series: TimeSeries[];
  width: number;
  height: number;
  unit?: string;
  dataset: DatasetId;
}

interface TooltipState {
  x: number;
  y: number;
  date: string;
  items: { label: string; value: number; color: string }[];
}

const MARGIN = { top: 20, right: 30, bottom: 48, left: 65 };

export function SlopeChart({ series, width, height, unit, dataset }: SlopeChartProps) {
  const xAxisRef = useRef<SVGGElement>(null);
  const yAxisRef = useRef<SVGGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  const allDates = Array.from(
    new Set(series.flatMap(s => s.observations.map(o => o.date)))
  ).sort();

  const xScale = d3.scalePoint<string>()
    .domain(allDates)
    .range([0, innerWidth])
    .padding(0.3);

  const allValues = series.flatMap(s => s.observations.map(o => o.value));
  const dataMin = d3.min(allValues) ?? 0;
  const dataMax = d3.max(allValues) ?? 0;
  const range = dataMax - dataMin;
  const yMin = dataMin > 0 && dataMin > range * 0.3 ? dataMin - range * 0.15 : 0;
  const yMax = dataMax + range * 0.2;

  const yScale = d3.scaleLinear()
    .domain([yMin, yMax || 1])
    .nice()
    .range([innerHeight, 0]);

  useEffect(() => {
    if (xAxisRef.current) {
      const xAxis = d3.axisBottom(xScale);
      const g = d3.select(xAxisRef.current).call(xAxis);
      g.select('.domain').attr('stroke', '#cbd5e1');
      g.selectAll('.tick line').attr('stroke', 'transparent');
      g.selectAll('text')
        .style('font-size', '9px')
        .style('fill', '#64748b');
    }
    if (yAxisRef.current) {
      const yAxis = d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(d => {
          const val = d as number;
          if (unit === '%') return `${val.toFixed(val % 1 === 0 ? 0 : 1)}%`;
          if (Math.abs(val) >= 10000000) return `${(val / 10000000).toFixed(1)}Cr`;
          if (Math.abs(val) >= 100000) return `${(val / 100000).toFixed(2)}L`;
          if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(0)}K`;
          return val.toLocaleString('en-IN');
        });
      const g = d3.select(yAxisRef.current).call(yAxis);
      g.select('.domain').attr('stroke', 'transparent');
      g.selectAll('.tick line').attr('stroke', '#f1f5f9').attr('stroke-dasharray', '2,2');
      g.selectAll('text').style('font-size', '9px').style('fill', '#64748b');
    }
  }, [xScale, yScale, unit]);

  // Find nearest date index from mouse position
  const handleMouseMove = (e: React.MouseEvent<SVGRectElement>) => {
    const svg = e.currentTarget.closest('svg');
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    const mx = svgPt.x - MARGIN.left;

    // Find the closest date on the x-axis
    let closestIdx = 0;
    let closestDist = Infinity;
    for (let i = 0; i < allDates.length; i++) {
      const dx = Math.abs((xScale(allDates[i]) || 0) - mx);
      if (dx < closestDist) {
        closestDist = dx;
        closestIdx = i;
      }
    }

    const date = allDates[closestIdx];
    const items: TooltipState['items'] = [];
    for (let si = 0; si < series.length; si++) {
      const obs = series[si].observations.find(o => o.date === date);
      if (obs) {
        items.push({
          label: series[si].label || series[si].statVar,
          value: obs.value,
          color: getDatasetColor(dataset, si),
        });
      }
    }

    setHoverIdx(closestIdx);
    setTooltip({
      x: e.clientX,
      y: e.clientY,
      date,
      items,
    });
  };

  return (
    <div className="slope-chart-wrapper">
      {/* Legend */}
      {series.length > 1 && (
        <div className="chart-legend">
          {series.map((s, i) => (
            <div key={i} className="legend-item">
              <span className="legend-line" style={{ backgroundColor: getDatasetColor(dataset, i) }} />
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

          {/* Hover vertical guide line */}
          {hoverIdx !== null && (
            <line
              x1={xScale(allDates[hoverIdx]) || 0}
              x2={xScale(allDates[hoverIdx]) || 0}
              y1={0}
              y2={innerHeight}
              stroke="#94a3b8"
              strokeWidth={1}
              strokeDasharray="4,3"
              pointerEvents="none"
            />
          )}

          {/* Lines and dots per series */}
          {series.map((s, si) => {
            const color = getDatasetColor(dataset, si);
            const sortedObs = [...s.observations].sort((a, b) => a.date.localeCompare(b.date));

            return (
              <g key={si}>
                <path
                  d={
                    d3.line<{ date: string; value: number }>()
                      .x(d => xScale(d.date) || 0)
                      .y(d => yScale(d.value))
                      .curve(d3.curveMonotoneX)(sortedObs) || ''
                  }
                  fill="none"
                  stroke={color}
                  strokeWidth={2.5}
                />

                {sortedObs.map((obs, oi) => {
                  const cx = xScale(obs.date) || 0;
                  const cy = yScale(obs.value);
                  const isFirst = oi === 0;
                  const isHovered = hoverIdx !== null && allDates[hoverIdx] === obs.date;

                  return (
                    <g key={oi}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHovered ? 6 : 4.5}
                        fill={isHovered ? '#fff' : color}
                        stroke={color}
                        strokeWidth={isHovered ? 3 : 2}
                      />
                      {/* Static value labels (hide when tooltip is showing to reduce clutter) */}
                      {hoverIdx === null && (
                        <text
                          x={isFirst ? cx + 8 : cx}
                          y={cy - 10}
                          textAnchor={isFirst ? 'start' : 'middle'}
                          fontSize={9}
                          fill="#475569"
                          fontWeight={500}
                        >
                          {formatValue(obs.value, unit)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Axes */}
          <g ref={xAxisRef} transform={`translate(0,${innerHeight})`} className="axis x-axis" />
          <g ref={yAxisRef} className="axis y-axis" />

          {/* Invisible hover overlay */}
          <rect
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { setTooltip(null); setHoverIdx(null); }}
          />
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="chart-tooltip"
          style={{ left: tooltip.x + 16, top: tooltip.y - 16 }}
        >
          <div className="tooltip-date">{formatDate(tooltip.date)}</div>
          {tooltip.items.map((item, i) => (
            <div key={i} className="tooltip-row">
              {series.length > 1 && (
                <span className="tooltip-swatch" style={{ backgroundColor: item.color }} />
              )}
              {series.length > 1 && (
                <span className="tooltip-label">{item.label}: </span>
              )}
              <span className="tooltip-value">{formatValue(item.value, unit)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
