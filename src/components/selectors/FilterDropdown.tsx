import { useState, useRef, useEffect } from 'react';
import type { FilterDimension } from '../../types';

interface FilterDropdownProps {
  filter: FilterDimension;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiSelect?: boolean;
}

export function FilterDropdown({ filter, value, onChange, multiSelect = false }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // --- Single-select mode (default) ---
  if (!multiSelect) {
    const singleValue = typeof value === 'string' ? value : (value[0] ?? filter.defaultValue);
    return (
      <div className="filter-dropdown">
        <label className="filter-label">{filter.label}</label>
        <select
          className="filter-select"
          value={singleValue}
          onChange={e => onChange(e.target.value)}
        >
          {filter.options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // --- Multi-select mode ---
  const selectedValues: string[] = Array.isArray(value) ? value : [value];

  const allValues = filter.options.map(opt => opt.value);
  const allSelected = allValues.length > 0 && allValues.every(v => selectedValues.includes(v));

  function toggleOption(optValue: string) {
    const next = selectedValues.includes(optValue)
      ? selectedValues.filter(v => v !== optValue)
      : [...selectedValues, optValue];
    onChange(next);
  }

  function handleSelectAll() {
    if (allSelected) {
      // Clear all
      onChange([]);
    } else {
      // Select all
      onChange(allValues);
    }
  }

  // Build button label
  let buttonLabel: string;
  if (selectedValues.length === 0) {
    buttonLabel = 'None selected';
  } else if (selectedValues.length === 1) {
    const match = filter.options.find(opt => opt.value === selectedValues[0]);
    buttonLabel = match ? match.label : selectedValues[0];
  } else {
    buttonLabel = `${selectedValues.length} selected`;
  }

  return (
    <div className="filter-dropdown filter-multi-select" ref={containerRef}>
      <label className="filter-label">{filter.label}</label>
      <button
        type="button"
        className="filter-select"
        onClick={() => setOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {buttonLabel}
      </button>
      {open && (
        <div className="filter-multi-dropdown">
          <label className="filter-multi-option filter-multi-option--toggle-all">
            <input
              type="checkbox"
              className="filter-multi-checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
            />
            {allSelected ? 'Clear All' : 'Select All'}
          </label>
          {filter.options.map(opt => (
            <label key={opt.value} className="filter-multi-option">
              <input
                type="checkbox"
                className="filter-multi-checkbox"
                checked={selectedValues.includes(opt.value)}
                onChange={() => toggleOption(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
