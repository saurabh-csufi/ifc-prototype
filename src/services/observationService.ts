import { fetchObservations, fetchStatVarNames } from './dataCommonsApi';
import type { IndicatorConfig, FilterState, TimeSeries } from '../types';

/**
 * Derive a human-readable label from a stat var name by removing the common prefix.
 */
function deriveLabel(statVar: string, allStatVars: string[]): string {
  if (allStatVars.length <= 1) return '';

  const parts = allStatVars.map(sv => sv.split('_'));
  let commonLength = 0;
  if (parts.length > 0) {
    const first = parts[0];
    for (let i = 0; i < first.length; i++) {
      if (parts.every(p => p[i] === first[i])) {
        commonLength = i + 1;
      } else {
        break;
      }
    }
  }

  const svParts = statVar.split('_');
  const uniqueParts = svParts.slice(commonLength);
  return uniqueParts.join(' ') || statVar;
}

/**
 * Pick the best facet from orderedFacets — the one with the most observations.
 */
function pickBestFacet(facets: Array<{ facetId: string; observations?: Array<{ date: string; value: number }>; obsCount?: number }>) {
  if (facets.length === 0) return null;
  if (facets.length === 1) return facets[0];

  // Prefer the facet with the most observations
  let best = facets[0];
  let bestCount = best.observations?.length ?? best.obsCount ?? 0;
  for (let i = 1; i < facets.length; i++) {
    const count = facets[i].observations?.length ?? facets[i].obsCount ?? 0;
    if (count > bestCount) {
      best = facets[i];
      bestCount = count;
    }
  }
  return best;
}

/**
 * Expand multi-select filter values into all single-value filter combinations.
 * E.g., { gender: ['Male','Female'], level: 'Primary' } expands to:
 *   [{ gender: 'Male', level: 'Primary' }, { gender: 'Female', level: 'Primary' }]
 */
function expandMultiSelectFilters(filters: FilterState): Record<string, string>[] {
  const keys = Object.keys(filters);
  let combos: Record<string, string>[] = [{}];

  for (const key of keys) {
    const val = filters[key];
    if (Array.isArray(val) && val.length > 0) {
      const expanded: Record<string, string>[] = [];
      for (const combo of combos) {
        for (const v of val) {
          expanded.push({ ...combo, [key]: v });
        }
      }
      combos = expanded;
    } else {
      const singleVal = Array.isArray(val) ? val[0] ?? '' : val;
      combos = combos.map(c => ({ ...c, [key]: singleVal }));
    }
  }

  return combos;
}

/**
 * Fetch observation data for an indicator given a state and filter selections.
 * Returns chart-ready TimeSeries array — exactly one series per resolved stat var.
 */
export async function fetchIndicatorData(
  config: IndicatorConfig,
  entityDcid: string,
  filters: FilterState
): Promise<TimeSeries[]> {
  // Expand multi-select filters into single-value combinations
  const filterCombos = expandMultiSelectFilters(filters);
  const resolvedVarsSet = new Set<string>();
  for (const combo of filterCombos) {
    for (const sv of config.resolveStatVars(combo)) {
      resolvedVarsSet.add(sv);
    }
  }
  const resolvedVars = Array.from(resolvedVarsSet);

  if (resolvedVars.length === 0) {
    return [];
  }

  // Fetch observations and human-readable names in parallel
  const [response, nameMap] = await Promise.all([
    fetchObservations({
      variableDcids: resolvedVars,
      entityDcids: [entityDcid],
      date: '',
      select: ['date', 'entity', 'variable', 'value'],
    }),
    fetchStatVarNames(resolvedVars),
  ]);

  const series: TimeSeries[] = [];

  for (const statVar of resolvedVars) {
    const varData = response.byVariable?.[statVar];
    if (!varData) continue;

    // Only look at data for our requested entity
    const entityData = varData.byEntity?.[entityDcid];
    if (!entityData) continue;

    const facets = entityData.orderedFacets;
    if (!facets || facets.length === 0) continue;

    // Pick the best single facet (most observations)
    const bestFacet = pickBestFacet(facets);
    if (!bestFacet) continue;

    const observations = bestFacet.observations || [];
    if (observations.length === 0) continue;

    const sortedObs = [...observations].sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // Use human-readable name from API, fall back to derived label
    const apiName = nameMap[statVar];
    const label = apiName || deriveLabel(statVar, resolvedVars);

    series.push({
      statVar,
      label,
      observations: sortedObs,
      facetId: bestFacet.facetId,
    });
  }

  return series;
}
