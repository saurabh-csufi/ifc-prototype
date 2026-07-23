import { useState, useMemo } from 'react';
import type { FilterState } from '../../types';
import { getIndicatorById } from '../../config/indicators';
import { ChartContainer } from '../charts/ChartContainer';
import { getChartComponent } from '../charts/ChartRegistry';
import { useIndicatorData } from '../../hooks/useIndicatorData';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { EmptyState } from '../common/EmptyState';
import { getDatasetAccent } from '../../utils/colors';

export function EmbedView() {
  const params = new URLSearchParams(window.location.search);
  const indicatorId = params.get('indicator') || '';
  const entityDcid = params.get('state') || 'wikidataId/Q1159';

  const config = getIndicatorById(indicatorId);

  // Extract filter values from URL params (f_gender, f_level, etc.)
  const initialFilters: FilterState = {};
  if (config) {
    for (const f of config.filters) {
      const val = params.get(`f_${f.id}`);
      initialFilters[f.id] = val || f.defaultValue;
    }
  }

  const [viewIndex, setViewIndex] = useState(0);
  const stableFilters = useMemo(() => initialFilters, []);

  if (!config) {
    return (
      <div className="embed-error">
        <p>Indicator not found</p>
      </div>
    );
  }

  return (
    <div className="embed-wrapper">
      <EmbedChart
        config={config}
        entityDcid={entityDcid}
        filters={stableFilters}
        viewIndex={viewIndex}
        setViewIndex={setViewIndex}
      />
    </div>
  );
}

function EmbedChart({
  config,
  entityDcid,
  filters,
  viewIndex,
  setViewIndex,
}: {
  config: ReturnType<typeof getIndicatorById> & {};
  entityDcid: string;
  filters: FilterState;
  viewIndex: number;
  setViewIndex: (v: number) => void;
}) {
  const { series, loading, error } = useIndicatorData(config, entityDcid, filters);
  const accentColor = getDatasetAccent(config.dataset);
  const views = config.views;
  const activeView = views?.[viewIndex];
  const chartType = activeView?.chartType ?? 'line';
  const ChartComponent = getChartComponent(chartType);

  return (
    <div className="embed-card">
      <div className="embed-card-header">
        <h3>{config.name}</h3>
        {views && views.length > 0 && (
          <div className="viz-toggle">
            {views.map((view, idx) => (
              <button
                key={idx}
                className={`viz-toggle-btn ${viewIndex === idx ? 'active' : ''}`}
                style={viewIndex === idx ? { backgroundColor: accentColor, color: '#fff' } : {}}
                onClick={() => setViewIndex(idx)}
              >
                {view.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="embed-card-body">
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

      <div className="embed-card-footer">
        <span>Source: {config.source}</span>
        <a href={window.location.origin} target="_blank" rel="noopener noreferrer" className="embed-branding">
          Bharat In Data
        </a>
      </div>
    </div>
  );
}
