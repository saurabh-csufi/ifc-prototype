import { useState, useRef, useEffect } from 'react';
import type { IndicatorConfig } from '../../types';

interface SectionHeaderProps {
  label: string;
  color: string;
  indicators: IndicatorConfig[];
  visibleIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function SectionHeader({
  label,
  color,
  indicators,
  visibleIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: SectionHeaderProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const visibleCount = indicators.filter(i => visibleIds.has(i.id)).length;
  const totalCount = indicators.length;
  const selectLabel = visibleCount === totalCount ? 'All' : `${visibleCount} of ${totalCount}`;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="section-header-row">
      <div className="section-header" style={{ borderLeftColor: color }}>
        <h2 className="section-title">{label}</h2>
      </div>
      <div className="section-indicator-filter" ref={ref}>
        <span className="section-filter-label">INDICATOR</span>
        <button
          className="section-filter-btn"
          onClick={() => setOpen(!open)}
        >
          <span>{selectLabel}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2.5 4l2.5 2.5 2.5-2.5" stroke="#64748b" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          </svg>
        </button>
        {open && (
          <div className="section-ms-dropdown">
            <div className="section-ms-actions">
              <button className="indicator-ms-action" onClick={onSelectAll}>Select All</button>
              <button className="indicator-ms-action" onClick={onDeselectAll}>Deselect All</button>
            </div>
            <div className="section-ms-list">
              {indicators.map(ind => (
                <label key={ind.id} className="section-ms-item">
                  <input
                    type="checkbox"
                    checked={visibleIds.has(ind.id)}
                    onChange={() => onToggle(ind.id)}
                  />
                  <span>{ind.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
