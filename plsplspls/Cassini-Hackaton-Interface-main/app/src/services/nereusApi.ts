const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

/**
 * Generic fetch wrapper to ensure graceful fallbacks if the backend is offline.
 * @param input Fetch URL or Request
 * @param init Fetch init options
 * @param fallbackValue Value to return if the fetch fails
 */
async function safeFetch<T>(input: RequestInfo | URL, init?: RequestInit, fallbackValue?: T): Promise<T> {
  try {
    const response = await fetch(input, init);
    if (!response.ok) {
      console.warn(`[API] Error response from ${input.toString()}: ${response.status} ${response.statusText}`);
      // Fallback on HTTP errors rather than throwing if desired, but typically we want JSON if possible.
      // We will attempt to return fallback if it's not OK.
      return fallbackValue as T;
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error(`[API] Network or parsing error on ${input.toString()}:`, error);
    return fallbackValue as T;
  }
}

export const api = {
  // alerts
  getAlerts: () => safeFetch<any[]>(`${BASE}/api/alerts`, undefined, []),

  // reports
  getReports: () => safeFetch<any[]>(`${BASE}/api/reports`, undefined, []),
  
  postReport: (body: object) => safeFetch<any>(`${BASE}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, null),

  // scan
  triggerScan: (bbox: object) => safeFetch<any>(`${BASE}/api/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bbox),
  }, null),

  // zones
  getZones: () => safeFetch<any[]>(`${BASE}/api/zones`, undefined, []),
  
  postZone: (body: object) => safeFetch<any>(`${BASE}/api/zones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, null),
  
  deleteZone: (id: number) => safeFetch<any>(`${BASE}/api/zones/${id}`, {
    method: 'DELETE'
  }, null),

  // subscriptions
  subscribe: (body: object) => safeFetch<any>(`${BASE}/api/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, null),
  
  unsubscribe: (token: string) => safeFetch<any>(`${BASE}/api/subscribe/${token}`, {
    method: 'DELETE'
  }, null),
  
  subscriberCount: () => safeFetch<{count: number}>(`${BASE}/api/subscribers/count`, undefined, { count: 0 }),

  // ml
  analyzeML: (body: { ndwi: number; ndci: number; turbidity: number }) => safeFetch<any>(`${BASE}/api/ml/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, null),

  // health
  health: () => safeFetch<{status: string}>(`${BASE}/api/health`, undefined, { status: 'offline' }),
};
