import { useState, useRef, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { INDICATORS } from '../../config/indicators';
import { DATASETS, DATASET_ORDER } from '../../config/datasets';
import type { StateEntity } from '../../types';

export function FilterPanel() {
  const { state, selectState, dispatch } = useDashboard();
  const [indicatorOpen, setIndicatorOpen] = useState(false);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const allOptions: StateEntity[] = state.statesList;
  const selectedCount = state.visibleIndicatorIds.size;
  const totalCount = INDICATORS.length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (indicatorRef.current && !indicatorRef.current.contains(e.target as Node)) {
        setIndicatorOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleIndicator = (id: string) => {
    dispatch({ type: 'TOGGLE_INDICATOR', payload: id });
  };

  const selectAll = () => {
    dispatch({
      type: 'SET_VISIBLE_INDICATORS',
      payload: new Set(INDICATORS.map(i => i.id)),
    });
  };

  const deselectAll = () => {
    dispatch({ type: 'SET_VISIBLE_INDICATORS', payload: new Set() });
  };

  const label =
    selectedCount === totalCount
      ? 'All indicators'
      : selectedCount === 0
      ? 'No indicators selected'
      : `${selectedCount} of ${totalCount} indicators`;

  return (
    <div className="filter-panel">
      <div className="filter-panel-row">
        <label className="filter-panel-label">THEME</label>
        <select className="filter-panel-select" disabled>
          <option>Education</option>
        </select>
      </div>

      <div className="filter-panel-row">
        <label className="filter-panel-label">STATE</label>
        <select
          className="filter-panel-select"
          value={state.selectedState.dcid}
          onChange={e => {
            const found = allOptions.find(s => s.dcid === e.target.value);
            if (found) selectState(found);
          }}
        >
          {allOptions.map(s => (
            <option key={s.dcid} value={s.dcid}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-panel-row" ref={indicatorRef}>
        <label className="filter-panel-label">INDICATOR</label>
        <button
          className="filter-panel-select filter-panel-multiselect-btn"
          onClick={() => setIndicatorOpen(!indicatorOpen)}
        >
          <span>{label}</span>
        </button>

        {indicatorOpen && (
          <div className="indicator-multiselect-dropdown">
            <div className="indicator-ms-actions">
              <button className="indicator-ms-action" onClick={selectAll}>Select All</button>
              <button className="indicator-ms-action" onClick={deselectAll}>Deselect All</button>
            </div>
            <div className="indicator-ms-list">
              {DATASET_ORDER.map(dsId => {
                const ds = DATASETS[dsId];
                const dsIndicators = INDICATORS.filter(i => i.dataset === dsId);
                return (
                  <div key={dsId} className="indicator-ms-group">
                    <div className="indicator-ms-group-header" style={{ borderLeftColor: ds.color }}>
                      {ds.label}
                    </div>
                    {dsIndicators.map(ind => (
                      <label key={ind.id} className="indicator-ms-item">
                        <input
                          type="checkbox"
                          checked={state.visibleIndicatorIds.has(ind.id)}
                          onChange={() => toggleIndicator(ind.id)}
                        />
                        <span>{ind.name}</span>
                      </label>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
