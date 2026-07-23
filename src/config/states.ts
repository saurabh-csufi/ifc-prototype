import type { StateEntity } from '../types';
import { fetchNodes } from '../services/dataCommonsApi';

/**
 * Hardcoded fallback list of Indian states/UTs with their Data Commons DCIDs.
 * Used as fallback if the API is unavailable.
 */
export const DEFAULT_STATE: StateEntity = {
  dcid: 'wikidataId/Q1353',
  name: 'Delhi',
};

export const INDIA_ENTITY: StateEntity = {
  dcid: 'country/IND',
  name: 'India',
};

export const FALLBACK_STATES: StateEntity[] = [
  { dcid: 'wikidataId/Q1159', name: 'Andhra Pradesh' },
  { dcid: 'wikidataId/Q1174', name: 'Arunachal Pradesh' },
  { dcid: 'wikidataId/Q1164', name: 'Assam' },
  { dcid: 'wikidataId/Q1165', name: 'Bihar' },
  { dcid: 'wikidataId/Q1168', name: 'Chhattisgarh' },
  { dcid: 'wikidataId/Q1171', name: 'Goa' },
  { dcid: 'wikidataId/Q1061', name: 'Gujarat' },
  { dcid: 'wikidataId/Q1174', name: 'Haryana' },
  { dcid: 'wikidataId/Q1177', name: 'Himachal Pradesh' },
  { dcid: 'wikidataId/Q1180', name: 'Jharkhand' },
  { dcid: 'wikidataId/Q1185', name: 'Karnataka' },
  { dcid: 'wikidataId/Q1186', name: 'Kerala' },
  { dcid: 'wikidataId/Q1188', name: 'Madhya Pradesh' },
  { dcid: 'wikidataId/Q1191', name: 'Maharashtra' },
  { dcid: 'wikidataId/Q1193', name: 'Manipur' },
  { dcid: 'wikidataId/Q1195', name: 'Meghalaya' },
  { dcid: 'wikidataId/Q1502', name: 'Mizoram' },
  { dcid: 'wikidataId/Q1497', name: 'Nagaland' },
  { dcid: 'wikidataId/Q22048', name: 'Odisha' },
  { dcid: 'wikidataId/Q22424', name: 'Punjab' },
  { dcid: 'wikidataId/Q1437', name: 'Rajasthan' },
  { dcid: 'wikidataId/Q1505', name: 'Sikkim' },
  { dcid: 'wikidataId/Q1445', name: 'Tamil Nadu' },
  { dcid: 'wikidataId/Q677037', name: 'Telangana' },
  { dcid: 'wikidataId/Q1363', name: 'Tripura' },
  { dcid: 'wikidataId/Q1498', name: 'Uttar Pradesh' },
  { dcid: 'wikidataId/Q1499', name: 'Uttarakhand' },
  { dcid: 'wikidataId/Q1356', name: 'West Bengal' },
  // Union Territories
  { dcid: 'wikidataId/Q46013', name: 'Andaman and Nicobar Islands' },
  { dcid: 'wikidataId/Q66743', name: 'Chandigarh' },
  { dcid: 'wikidataId/Q66710', name: 'Dadra and Nagar Haveli and Daman and Diu' },
  { dcid: 'wikidataId/Q1353', name: 'Delhi' },
  { dcid: 'wikidataId/Q66585', name: 'Jammu and Kashmir' },
  { dcid: 'wikidataId/Q200667', name: 'Ladakh' },
  { dcid: 'wikidataId/Q66568', name: 'Lakshadweep' },
  { dcid: 'wikidataId/Q66550', name: 'Puducherry' },
];

/**
 * Fetch state list dynamically from Data Commons Node API.
 * Falls back to hardcoded list on error.
 */
export async function fetchStatesList(): Promise<StateEntity[]> {
  try {
    const response = await fetchNodes({
      nodes: ['country/IND'],
      property: '<-containedInPlace+{typeOf:State}',
    });

    const indiaData = response.data?.['country/IND'];
    const nodes = indiaData?.arcs?.['containedInPlace']?.nodes
      || indiaData?.arcs?.['containedInPlace+']?.nodes
      || [];

    if (nodes.length === 0) {
      return FALLBACK_STATES;
    }

    const states: StateEntity[] = nodes
      .filter(n => n.dcid && n.name)
      .map(n => ({ dcid: n.dcid, name: n.name! }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return states.length > 0 ? states : FALLBACK_STATES;
  } catch {
    return FALLBACK_STATES;
  }
}
