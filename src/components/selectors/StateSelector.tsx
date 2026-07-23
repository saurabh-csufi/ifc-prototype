import { useState, useRef, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { INDIA_ENTITY } from '../../config/states';
import type { StateEntity } from '../../types';

export function StateSelector() {
  const { state, selectState } = useDashboard();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const allOptions: StateEntity[] = [INDIA_ENTITY, ...state.statesList];
  const filtered = search
    ? allOptions.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    : allOptions;

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
    <div className="selector-container" ref={containerRef}>
      <label className="selector-label">State/UT</label>
      <button className="selector-button" onClick={() => setOpen(!open)}>
        <span>{state.selectedState.name}</span>
        <span className="selector-arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="selector-dropdown">
          <input
            className="selector-search"
            type="text"
            placeholder="Search states..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <div className="selector-options">
            {state.statesLoading ? (
              <div className="selector-option disabled">Loading...</div>
            ) : (
              filtered.map(s => (
                <div
                  key={s.dcid}
                  className={`selector-option ${s.dcid === state.selectedState.dcid ? 'selected' : ''}`}
                  onClick={() => {
                    selectState(s);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  {s.name}
                </div>
              ))
            )}
            {!state.statesLoading && filtered.length === 0 && (
              <div className="selector-option disabled">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
