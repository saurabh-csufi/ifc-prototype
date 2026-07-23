import { useState, useRef, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { INDICATORS } from '../../config/indicators';
import { DATASETS, DATASET_ORDER } from '../../config/datasets';

export function IndicatorMultiSelect() {
  const { state, toggleIndicator, selectAllIndicators, deselectAllIndicators } = useDashboard();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCount = state.visibleIndicatorIds.size;
  const totalCount = INDICATORS.length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="selector-container indicator-multi-select" ref={containerRef}>
      <label className="selector-label">Indicators</label>
      <button className="selector-button" onClick={() => setOpen(!open)}>
        <span>{selectedCount} of {totalCount} selected</span>
        <span className="selector-arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="selector-dropdown indicator-dropdown">
          <div className="indicator-dropdown-actions">
            <button className="action-btn" onClick={selectAllIndicators}>Select All</button>
            <button className="action-btn" onClick={deselectAllIndicators}>Deselect All</button>
          </div>
          <div className="selector-options">
            {DATASET_ORDER.map(dsId => {
              const ds = DATASETS[dsId];
              const dsIndicators = INDICATORS.filter(i => i.dataset === dsId);
              return (
                <div key={dsId} className="indicator-group">
                  <div className="indicator-group-header" style={{ borderLeftColor: ds.color }}>
                    {ds.label}
                  </div>
                  {dsIndicators.map(ind => (
                    <label key={ind.id} className="indicator-checkbox">
                      <input
                        type="checkbox"
                        checked={state.visibleIndicatorIds.has(ind.id)}
                        onChange={() => toggleIndicator(ind.id)}
                      />
                      <span className="indicator-checkbox-label">{ind.name}</span>
                    </label>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
