import { useDashboard } from '../../context/DashboardContext';
import { INDICATORS } from '../../config/indicators';
import { DATASETS, DATASET_ORDER } from '../../config/datasets';
import { SectionHeader } from './SectionHeader';
import { CardCarousel } from './CardCarousel';

export function Dashboard() {
  const { state, dispatch } = useDashboard();

  const toggleIndicator = (id: string) => {
    dispatch({ type: 'TOGGLE_INDICATOR', payload: id });
  };

  const selectAllInDataset = (dsId: string) => {
    const dsIndicatorIds = INDICATORS.filter(i => i.dataset === dsId).map(i => i.id);
    const next = new Set(state.visibleIndicatorIds);
    dsIndicatorIds.forEach(id => next.add(id));
    dispatch({ type: 'SET_VISIBLE_INDICATORS', payload: next });
  };

  const deselectAllInDataset = (dsId: string) => {
    const dsIndicatorIds = new Set(INDICATORS.filter(i => i.dataset === dsId).map(i => i.id));
    const next = new Set(state.visibleIndicatorIds);
    dsIndicatorIds.forEach(id => next.delete(id));
    dispatch({ type: 'SET_VISIBLE_INDICATORS', payload: next });
  };

  return (
    <main className="dashboard">
      {DATASET_ORDER.map(dsId => {
        const ds = DATASETS[dsId];
        const allDsIndicators = INDICATORS.filter(i => i.dataset === dsId);
        const visibleIndicators = allDsIndicators.filter(i => state.visibleIndicatorIds.has(i.id));

        if (visibleIndicators.length === 0 && allDsIndicators.length === 0) return null;

        return (
          <section key={dsId} className="dataset-section">
            <SectionHeader
              label={ds.label}
              color={ds.color}
              indicators={allDsIndicators}
              visibleIds={state.visibleIndicatorIds}
              onToggle={toggleIndicator}
              onSelectAll={() => selectAllInDataset(dsId)}
              onDeselectAll={() => deselectAllInDataset(dsId)}
            />
            {visibleIndicators.length > 0 ? (
              <CardCarousel
                indicators={visibleIndicators}
                entityDcid={state.selectedState.dcid}
                dataset={dsId}
              />
            ) : (
              <div className="empty-state">No indicators selected for {ds.label}</div>
            )}
          </section>
        );
      })}
    </main>
  );
}
