// ===== Entity Types =====

export interface StateEntity {
  dcid: string;
  name: string;
}

// ===== Dataset & Theme Types =====

export type DatasetId = 'AISHE' | 'UDISE' | 'NSS80';

export interface DatasetConfig {
  id: DatasetId;
  label: string;
  color: string;
  source: string;
}

// ===== Filter Types =====

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDimension {
  id: string;
  label: string;
  options: FilterOption[];
  defaultValue: string;
}

export type FilterState = Record<string, string | string[]>;

// ===== Chart View Types =====

export type ViewChartType =
  | 'line'
  | 'area'
  | 'bar'
  | 'groupedBar'
  | 'horizontalBar'
  | 'horizontalGroupedBar'
  | 'stackedBar'
  | 'pie'
  | 'lollipop'
  | 'treemap'
  | 'scatter'
  | 'heatmap'
  | 'dumbbell'
  | 'butterfly';

export interface ViewFilterConfig {
  filterId: string;
  multiSelect: boolean;
}

export interface ChartViewConfig {
  chartType: ViewChartType;
  label: string;
  colorByLabel?: string;
  filters: ViewFilterConfig[];
}

// ===== Indicator Config =====

export type ChartType = 'line' | 'bar' | 'groupedBar';

export interface IndicatorConfig {
  id: string;
  name: string;
  dataset: DatasetId;
  chartType: ChartType;
  filters: FilterDimension[];
  statVars: string[];
  resolveStatVars: (filters: FilterState) => string[];
  source: string;
  unit?: string;
  yearType?: string;
  frequency?: string;
  views?: [ChartViewConfig, ChartViewConfig, ChartViewConfig];
}

// ===== Observation Data Types =====

export interface Observation {
  date: string;
  value: number;
}

export interface TimeSeries {
  statVar: string;
  label: string;
  observations: Observation[];
  facetId?: string;
}

export interface IndicatorData {
  indicatorId: string;
  entityDcid: string;
  series: TimeSeries[];
  loading: boolean;
  error: string | null;
}

// ===== Data Commons API Response Types =====

export interface DCFacetObservation {
  facetId: string;
  earliestDate?: string;
  latestDate?: string;
  obsCount?: number;
  observations?: Array<{ date: string; value: number }>;
}

export interface DCObservationResponse {
  byVariable: Record<string, {
    byEntity: Record<string, {
      orderedFacets: DCFacetObservation[];
    }>;
  }>;
  facets?: Record<string, {
    importName?: string;
    provenanceUrl?: string;
    measurementMethod?: string;
    observationPeriod?: string;
    unit?: string;
    scalingFactor?: string;
    isDcAggregate?: boolean;
  }>;
}

export interface DCNodeResponse {
  data: Record<string, {
    arcs?: Record<string, {
      nodes: Array<{
        dcid: string;
        name?: string;
        value?: string;
        types?: string[];
        provenanceId?: string;
      }>;
    }>;
    properties?: string[];
  }>;
  nextToken?: string;
}

// ===== Dashboard State Types =====

export interface DashboardState {
  selectedState: StateEntity;
  selectedTheme: string;
  visibleIndicatorIds: Set<string>;
  statesList: StateEntity[];
  statesLoading: boolean;
}

export type DashboardAction =
  | { type: 'SET_STATE'; payload: StateEntity }
  | { type: 'SET_THEME'; payload: string }
  | { type: 'TOGGLE_INDICATOR'; payload: string }
  | { type: 'SET_VISIBLE_INDICATORS'; payload: Set<string> }
  | { type: 'SET_STATES_LIST'; payload: StateEntity[] }
  | { type: 'SET_STATES_LOADING'; payload: boolean };
