import { useState, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { IndicatorConfig, FilterState, ChartViewConfig } from '../../types';
import { useIndicatorData } from '../../hooks/useIndicatorData';
import { useDashboard } from '../../context/DashboardContext';
import { FilterDropdown } from '../selectors/FilterDropdown';
import { ChartContainer } from '../charts/ChartContainer';
import { getChartComponent } from '../charts/ChartRegistry';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { EmptyState } from '../common/EmptyState';
import { DownloadButton } from './DownloadButton';
import { ShareEmbed } from './ShareEmbed';
import { getDatasetAccent } from '../../utils/colors';

interface IndicatorCardProps {
  config: IndicatorConfig;
  entityDcid: string;
}

const VIEW_ICONS = [
  // View 1 icon (chart-like)
  <svg key="v1" width="16" height="12" viewBox="0 0 16 12" fill="none">
    <line x1="2" y1="10" x2="14" y2="2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="2" cy="10" r="2" fill="currentColor"/>
    <circle cx="14" cy="2" r="2" fill="currentColor"/>
  </svg>,
  // View 2 icon (area/bar-like)
  <svg key="v2" width="16" height="12" viewBox="0 0 16 12" fill="none">
    <rect x="1" y="4" width="3" height="8" fill="currentColor" rx="0.5"/>
    <rect x="6" y="1" width="3" height="11" fill="currentColor" rx="0.5"/>
    <rect x="11" y="6" width="3" height="6" fill="currentColor" rx="0.5"/>
  </svg>,
  // View 3 icon (scatter/pie-like)
  <svg key="v3" width="16" height="12" viewBox="0 0 16 12" fill="none">
    <circle cx="4" cy="3" r="2.5" fill="currentColor"/>
    <circle cx="12" cy="5" r="2.5" fill="currentColor"/>
    <circle cx="7" cy="9" r="2.5" fill="currentColor"/>
  </svg>,
];

export function IndicatorCard({ config, entityDcid }: IndicatorCardProps) {
  const { state } = useDashboard();
  const [activeViewIndex, setActiveViewIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const views = config.views;
  const activeView: ChartViewConfig | undefined = views?.[activeViewIndex];

  // Build initial filter state from the indicator's filter definitions
  const [filterState, setFilterState] = useState<FilterState>(() =>
    Object.fromEntries(config.filters.map(f => [f.id, f.defaultValue]))
  );

  // When switching views, adapt filter values:
  // - multi-select filters expand to all non-'Total' options (if currently a single string)
  // - single-select filters collapse to the first value (if currently an array)
  useEffect(() => {
    if (!activeView) return;
    setFilterState(prev => {
      const next = { ...prev };
      let changed = false;
      for (const vf of activeView.filters) {
        const dim = config.filters.find(f => f.id === vf.filterId);
        if (!dim) continue;
        const currentVal = next[vf.filterId];
        if (vf.multiSelect && typeof currentVal === 'string') {
          const hasTotal = dim.options.some(o => o.value === 'Total');
          const nonTotalOptions = dim.options.filter(o => o.value !== 'Total');
          next[vf.filterId] = (hasTotal && nonTotalOptions.length > 0)
            ? nonTotalOptions.map(o => o.value)
            : dim.options.map(o => o.value);
          changed = true;
        } else if (!vf.multiSelect && Array.isArray(currentVal)) {
          next[vf.filterId] = currentVal[0] ?? dim.defaultValue;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [activeViewIndex, activeView, config.filters]);

  const stableFilters = useMemo(() => filterState, [JSON.stringify(filterState)]);
  const { series, loading, error } = useIndicatorData(config, entityDcid, stableFilters);

  const handleFilterChange = useCallback((filterId: string, value: string | string[]) => {
    setFilterState(prev => ({ ...prev, [filterId]: value }));
  }, []);

  const chartId = `chart-${config.id}`;
  const accentColor = getDatasetAccent(config.dataset);

  // Determine which filters to show for the active view
  const visibleFilters = useMemo(() => {
    if (!activeView || !activeView.filters || activeView.filters.length === 0) {
      // Fallback: show all indicator filters as single-select
      return config.filters.map(f => ({ dimension: f, multiSelect: false }));
    }
    return activeView.filters
      .map(vf => {
        const dimension = config.filters.find(f => f.id === vf.filterId);
        if (!dimension) return null;
        return { dimension, multiSelect: vf.multiSelect };
      })
      .filter(Boolean) as { dimension: typeof config.filters[0]; multiSelect: boolean }[];
  }, [activeView, config.filters]);

  // Close modal on Escape and lock body scroll
  useEffect(() => {
    if (!expanded) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [expanded]);

  // Get chart type for active view
  const chartType = activeView?.chartType ?? 'line';
  const ChartComponent = getChartComponent(chartType);

  return (
    <div className="indicator-card">
      <div className="indicator-card-header">
        <h3 className="indicator-card-title">{config.name}</h3>
      </div>

      {/* 3-View Toggle */}
      {views && views.length > 0 && (
        <div className="viz-toggle">
          {views.map((view, idx) => (
            <button
              key={idx}
              className={`viz-toggle-btn ${activeViewIndex === idx ? 'active' : ''}`}
              style={activeViewIndex === idx ? { backgroundColor: accentColor, color: '#fff' } : {}}
              onClick={() => setActiveViewIndex(idx)}
              title={view.label}
            >
              {VIEW_ICONS[idx]}
              <span>{view.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Filters for active view */}
      {visibleFilters.length > 0 && (
        <div className="indicator-card-filters">
          {visibleFilters.map(({ dimension, multiSelect }) => {
            const currentValue = filterState[dimension.id] ?? dimension.defaultValue;
            return (
              <FilterDropdown
                key={dimension.id}
                filter={dimension}
                value={currentValue}
                onChange={value => handleFilterChange(dimension.id, value)}
                multiSelect={multiSelect}
              />
            );
          })}
        </div>
      )}

      <div className="indicator-card-body" id={chartId}>
        {!loading && !error && series.length > 0 && (
          <button
            className="chart-expand-btn"
            onClick={() => setExpanded(true)}
            title="Expand chart"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && series.length === 0 && <EmptyState />}
        {!loading && !error && series.length > 0 && (
          <ChartContainer>
            {(dimensions) => (
              <ChartComponent
                series={series}
                width={dimensions.width}
                height={dimensions.height}
                unit={config.unit}
                dataset={config.dataset}
              />
            )}
          </ChartContainer>
        )}
      </div>

      <div className="indicator-card-footer">
        <span className="indicator-card-source">
          Source: {config.source}
        </span>
        <div className="indicator-card-actions">
          <ShareEmbed
            config={config}
            entityDcid={entityDcid}
            stateName={state.selectedState.name}
            filterState={filterState}
          />
          <DownloadButton chartId={chartId} series={series} indicatorName={config.name} config={config} entityDcid={entityDcid} />
        </div>
      </div>

      {/* Expanded chart modal */}
      {expanded && series.length > 0 && createPortal(
        <div className="chart-modal-overlay" onClick={() => setExpanded(false)}>
          <div className="chart-modal" onClick={e => e.stopPropagation()}>
            <div className="chart-modal-header">
              <h3 className="chart-modal-title">{config.name}</h3>
              <button className="chart-modal-close" onClick={() => setExpanded(false)} title="Close">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="chart-modal-body">
              <ChartContainer aspectRatio={16 / 9}>
                {(dimensions) => (
                  <ChartComponent
                    series={series}
                    width={dimensions.width}
                    height={dimensions.height}
                    unit={config.unit}
                    dataset={config.dataset}
                  />
                )}
              </ChartContainer>
            </div>
            <div className="chart-modal-footer">
              Source: {config.source}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
