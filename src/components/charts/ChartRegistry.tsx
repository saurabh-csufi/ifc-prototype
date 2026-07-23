import type { ComponentType } from 'react';
import type { TimeSeries, DatasetId, ViewChartType } from '../../types';
import { SlopeChart } from './SlopeChart';
import { BarChart } from './BarChart';
import { DumbbellChart } from './DumbbellChart';
import { AreaChart } from './AreaChart';
import { PieChart } from './PieChart';
import { LollipopChart } from './LollipopChart';
import { TreemapChart } from './TreemapChart';
import { HorizontalBarChart } from './HorizontalBarChart';
import { StackedBarChart } from './StackedBarChart';
import { ScatterChart } from './ScatterChart';
import { HeatmapChart } from './HeatmapChart';
import { ButterflyChart } from './ButterflyChart';

export interface ChartComponentProps {
  series: TimeSeries[];
  width: number;
  height: number;
  unit?: string;
  dataset: DatasetId;
}

const CHART_MAP: Record<ViewChartType, ComponentType<ChartComponentProps>> = {
  line: SlopeChart,
  area: AreaChart,
  bar: BarChart,
  groupedBar: BarChart,
  horizontalBar: HorizontalBarChart,
  horizontalGroupedBar: HorizontalBarChart,
  stackedBar: StackedBarChart,
  pie: PieChart,
  lollipop: LollipopChart,
  treemap: TreemapChart,
  scatter: ScatterChart,
  heatmap: HeatmapChart,
  dumbbell: DumbbellChart,
  butterfly: ButterflyChart,
};

export function getChartComponent(chartType: ViewChartType): ComponentType<ChartComponentProps> {
  return CHART_MAP[chartType] || SlopeChart;
}
