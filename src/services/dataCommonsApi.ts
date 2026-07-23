import type { DCObservationResponse, DCNodeResponse } from '../types';

const BASE_URL = '/api';

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// In-flight request deduplication
const inFlight = new Map<string, Promise<unknown>>();

function getCacheKey(endpoint: string, body: unknown): string {
  return `${endpoint}:${JSON.stringify(body)}`;
}

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T;
  }
  if (entry) cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function postRequest<T>(endpoint: string, body: unknown): Promise<T> {
  const cacheKey = getCacheKey(endpoint, body);

  // Check cache
  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  // Check in-flight
  const existing = inFlight.get(cacheKey);
  if (existing) return existing as Promise<T>;

  // Make request
  const promise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setCache(cacheKey, data);
      return data as T;
    } finally {
      inFlight.delete(cacheKey);
    }
  })();

  inFlight.set(cacheKey, promise);
  return promise;
}

export async function fetchObservations(params: {
  variableDcids: string[];
  entityDcids?: string[];
  entityExpression?: string;
  date: string;
  select?: string[];
}): Promise<DCObservationResponse> {
  const body: Record<string, unknown> = {
    date: params.date,
    variable: { dcids: params.variableDcids },
    select: params.select || ['date', 'entity', 'variable', 'value'],
  };

  if (params.entityDcids) {
    body.entity = { dcids: params.entityDcids };
  } else if (params.entityExpression) {
    body.entity = { expression: params.entityExpression };
  }

  return postRequest<DCObservationResponse>('/observation', body);
}

export async function fetchNodes(params: {
  nodes: string[];
  property: string;
}): Promise<DCNodeResponse> {
  return postRequest<DCNodeResponse>('/node', {
    nodes: params.nodes,
    property: params.property,
  });
}

// ===== Stat Var Name Resolution =====

/** Persistent cache for stat var human-readable names */
const statVarNameCache = new Map<string, string>();

/**
 * Fetch human-readable names for stat vars from Data Commons.
 * Uses the Node API to get the `name` property.
 * Returns a map of statVarDcid -> human-readable name.
 */
export async function fetchStatVarNames(
  statVars: string[]
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const toFetch: string[] = [];

  // Check cache first
  for (const sv of statVars) {
    const cached = statVarNameCache.get(sv);
    if (cached) {
      result[sv] = cached;
    } else {
      toFetch.push(sv);
    }
  }

  if (toFetch.length === 0) return result;

  try {
    const response = await fetchNodes({
      nodes: toFetch,
      property: '->name',
    });

    for (const sv of toFetch) {
      const nodeData = response.data?.[sv];
      const nameNodes = nodeData?.arcs?.name?.nodes;
      const name = nameNodes?.[0]?.value || nameNodes?.[0]?.name || '';
      if (name) {
        statVarNameCache.set(sv, name);
        result[sv] = name;
      }
    }
  } catch {
    // If name fetch fails, we'll fall back to derived labels
  }

  return result;
}

export function clearCache(): void {
  cache.clear();
}
