import type { DatasetId } from '../types';

/**
 * Per-dataset color palettes using shades of the dataset's base color.
 */
export const DATASET_PALETTES: Record<DatasetId, string[]> = {
  AISHE: [
    '#d97706', // amber-600
    '#b45309', // amber-700
    '#92400e', // amber-800
    '#f59e0b', // amber-500
    '#fbbf24', // amber-400
    '#78350f', // amber-900
  ],
  UDISE: [
    '#0d9488', // teal-600
    '#0f766e', // teal-700
    '#115e59', // teal-800
    '#14b8a6', // teal-500
    '#2dd4bf', // teal-400
    '#134e4a', // teal-900
  ],
  NSS80: [
    '#7c3aed', // violet-600
    '#6d28d9', // violet-700
    '#5b21b6', // violet-800
    '#8b5cf6', // violet-500
    '#a78bfa', // violet-400
    '#4c1d95', // violet-900
  ],
};

/**
 * Get a series color for a dataset, cycling through the palette.
 */
export function getDatasetColor(dataset: DatasetId, index: number): string {
  const palette = DATASET_PALETTES[dataset];
  return palette[index % palette.length];
}

/**
 * Get the primary (accent) color for a dataset.
 */
export function getDatasetAccent(dataset: DatasetId): string {
  return DATASET_PALETTES[dataset][0];
}
