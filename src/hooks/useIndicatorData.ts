import { useState, useEffect, useRef } from 'react';
import type { IndicatorConfig, FilterState, TimeSeries } from '../types';
import { fetchIndicatorData } from '../services/observationService';

interface UseIndicatorDataResult {
  series: TimeSeries[];
  loading: boolean;
  error: string | null;
}

export function useIndicatorData(
  config: IndicatorConfig,
  entityDcid: string,
  filters: FilterState
): UseIndicatorDataResult {
  const [series, setSeries] = useState<TimeSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(0);

  useEffect(() => {
    const requestId = ++abortRef.current;
    setLoading(true);
    setError(null);

    fetchIndicatorData(config, entityDcid, filters)
      .then(data => {
        if (requestId === abortRef.current) {
          setSeries(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (requestId === abortRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
          setSeries([]);
          setLoading(false);
        }
      });
  }, [config, entityDcid, filters]);

  return { series, loading, error };
}
