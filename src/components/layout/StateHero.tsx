import { useMemo } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { getStateSvg } from '../../config/stateMaps';

/** Parse an SVG path `d` attribute and return the bounding box. */
function getPathBounds(d: string): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  // Match all coordinate pairs after M, L, or implicit lineto
  const nums = d.match(/[-+]?\d*\.?\d+/g);
  if (!nums) return { minX: 0, minY: 0, maxX: 56, maxY: 72 };
  for (let i = 0; i < nums.length - 1; i += 2) {
    const x = parseFloat(nums[i]);
    const y = parseFloat(nums[i + 1]);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

export function StateHero() {
  const { state } = useDashboard();
  const stateName = state.selectedState.name;
  const svgPath = getStateSvg(stateName);

  // Compute a tight viewBox around the actual path with padding
  const viewBox = useMemo(() => {
    if (!svgPath) return '0 0 56 72';
    const { minX, minY, maxX, maxY } = getPathBounds(svgPath);
    const pad = Math.max((maxX - minX), (maxY - minY)) * 0.08;
    return `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;
  }, [svgPath]);

  return (
    <div className="state-hero">
      <div className="state-hero-map">
        {svgPath ? (
          <svg
            className="state-map-svg"
            width="80"
            height="80"
            viewBox={viewBox}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`Map outline of ${stateName}`}
          >
            <path d={svgPath} fill="#0e3258" stroke="#fff" strokeWidth="0.15" />
          </svg>
        ) : (
          <div className="state-map-placeholder">
            <span>{stateName.substring(0, 2).toUpperCase()}</span>
          </div>
        )}
      </div>
      <h2 className="state-hero-name">{stateName}</h2>
    </div>
  );
}
