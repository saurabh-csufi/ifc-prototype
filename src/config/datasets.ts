import type { DatasetConfig, DatasetId } from '../types';

export const DATASETS: Record<DatasetId, DatasetConfig> = {
  AISHE: {
    id: 'AISHE',
    label: 'AISHE',
    color: '#d97706', // amber
    source: 'All India Survey on Higher Education (AISHE), Ministry of Education',
  },
  UDISE: {
    id: 'UDISE',
    label: 'UDISE+',
    color: '#0d9488', // teal
    source: 'UDISE+, Department of School Education & Literacy',
  },
  NSS80: {
    id: 'NSS80',
    label: 'NSS 80th Round',
    color: '#7c3aed', // violet
    source: 'NSS 80th Round, Ministry of Statistics & Programme Implementation',
  },
};

export const DATASET_ORDER: DatasetId[] = ['AISHE', 'UDISE', 'NSS80'];
