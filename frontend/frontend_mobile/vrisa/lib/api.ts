// Simple fetch-based API client for the mobile app
import Constants from 'expo-constants';

// Build candidate bases including packager host (useful when running Expo on device)
const packagerHost = (() => {
  try {
    const hostUri = (Constants as any)?.manifest?.hostUri || (Constants as any)?.expoConfig?.hostUri;
    if (hostUri) {
      // hostUri often looks like '192.168.10.10:8081' -> use the host portion and port 8000 for API
      const host = hostUri.split(':')[0];
      if (host && host !== 'localhost') return `http://${host}:8000`;
    }
  } catch (e) {
    // ignore
  }
  return undefined;
})();

const CANDIDATE_BASES = [
  (process.env.EXPO_PUBLIC_API_URL as string) || undefined,
  packagerHost,
  'http://10.0.2.2:8000', // Android emulator special host
  'http://localhost:8000'
].filter(Boolean) as string[];

let resolvedBasePromise: Promise<string> | null = null;

function fetchWithTimeout(input: RequestInfo, init: RequestInit = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const signal = controller.signal as any;
  return fetch(input, { ...init, signal }).finally(() => clearTimeout(id));
}

async function probeBase(candidate: string) {
  try {
    const url = candidate.replace(/\/$/, '') + '/api/users/health/';
    const resp = await fetchWithTimeout(url, { method: 'GET' }, 2500);
    return resp.ok;
  } catch (e) {
    return false;
  }
}

// store last attempted URL and error for debugging
let _lastAttempt: { url?: string; error?: string | null } = {};

async function detectBase() {
  for (const c of CANDIDATE_BASES) {
    if (!c) continue;
    // try to probe; first that responds OK will be used
    try {
      // quick probe
      // eslint-disable-next-line no-await-in-loop
      const ok = await probeBase(c);
      if (ok) return c.replace(/\/$/, '');
    } catch (e) {
      // ignore and try next
    }
  }
  // fallback to localhost
  return 'http://localhost:8000';
}

async function getBase() {
  if (!resolvedBasePromise) resolvedBasePromise = detectBase();
  return resolvedBasePromise;
}

// allow overriding the detected base (useful for testing on device)
export async function setBase(url: string) {
  if (!url) return;
  const cleaned = url.replace(/\/$/, '');
  resolvedBasePromise = Promise.resolve(cleaned);
}

export async function detectedBase() {
  return getBase();
}

async function request(path: string, options: RequestInit = {}) {
  const base = await getBase();
  const url = base + path;
  _lastAttempt = { url, error: null };
  const headers: Record<string,string> = { 'Accept': 'application/json' };
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body as any);
  }
  options.headers = { ...(options.headers || {}), ...headers };

  let resp: Response;
  try {
    resp = await fetchWithTimeout(url, options, 8000);
  } catch (err: any) {
    _lastAttempt.error = err?.message || String(err);
    throw { kind: 'network', url, message: err?.message || String(err), original: err };
  }
  const text = await resp.text();
  let json: any = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch (parseErr) {
      // non-JSON response (e.g., plain text or HTML) — keep raw text in `text`
      json = null;
    }
  }
  if (!resp.ok) {
    // include parsed body when available, otherwise raw text
    throw { status: resp.status, body: json || text };
  }
  // prefer returning parsed JSON, but fall back to raw text
  return json !== null ? json : text;
}

export async function login(identifier: string, password: string) {
  return request('/api/users/login/', { method: 'POST', body: { identifier, password } });
}

export async function register(payload: any) {
  return request('/api/users/register/', { method: 'POST', body: payload });
}

export async function getStations() {
  try {
    const data = await request('/api/stations/');
    if (data && data.results) return data.results;
    if (Array.isArray(data)) return data;
    return [];
  } catch (err) {
    throw err;
  }
}

export async function getVariables() {
  return request('/api/variables/');
}

export async function getMeasurements(params: { station_id?: string; variable?: string; start_date?: string; end_date?: string; days?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.station_id) qs.set('station_id', String(params.station_id));
  if (params.variable) qs.set('variable', String(params.variable));
  if (params.start_date) qs.set('start_date', String(params.start_date));
  if (params.end_date) qs.set('end_date', String(params.end_date));
  if (params.days) qs.set('days', String(params.days));
  const path = '/api/measurements/' + (qs.toString() ? '?' + qs.toString() : '');
  const data = await request(path);
  // backend may return array or paginated { results: [] }
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as any).results)) return (data as any).results;
  return [];
}

export async function getAirQualityReport(params: { station_id?: string; start_date?: string; end_date?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.station_id) qs.set('station_id', String(params.station_id));
  if (params.start_date) qs.set('start_date', String(params.start_date));
  if (params.end_date) qs.set('end_date', String(params.end_date));
  const path = '/api/reports/air_quality/' + (qs.toString() ? '?' + qs.toString() : '');
  return request(path);
}

export async function getAlertsReport(params: { station_id?: string; variable?: string; days?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.station_id) qs.set('station_id', String(params.station_id));
  if (params.variable) qs.set('variable', String(params.variable));
  if (params.days) qs.set('days', String(params.days));
  const path = '/api/reports/alerts/' + (qs.toString() ? '?' + qs.toString() : '');
  return request(path);
}

export async function createStation(payload: any) {
  return request('/api/stations/', { method: 'POST', body: payload });
}

export async function getStation(id: string | number) {
  try {
    const list = await getStations();
    return (list || []).find((s: any) => String(s.station_id || s.id || s.stationId || s.name) === String(id)) || null;
  } catch (e) {
    return null;
  }
}

export async function probeHealth() {
  try {
    const base = await getBase();
    const url = base.replace(/\/$/, '') + '/api/users/health/';
    _lastAttempt = { url, error: null };
    const resp = await fetchWithTimeout(url, { method: 'GET' }, 3000);
    if (!resp.ok) {
      _lastAttempt.error = `http status ${resp.status}`;
    }
    return { ok: resp.ok, url, status: resp.status };
  } catch (e: any) {
    _lastAttempt = { url: _lastAttempt?.url, error: e?.message || String(e) };
    return { ok: false, url: _lastAttempt?.url, error: _lastAttempt.error };
  }
}

export function getLastAttempt() {
  return _lastAttempt;
}

const apiDefault = { login, register, getStations, createStation, getStation, setBase, detectedBase, probeHealth, getVariables, getAirQualityReport, getAlertsReport, getMeasurements };
// attach helper exports to default as well for convenience (e.g., getLastAttempt)
(apiDefault as any).getLastAttempt = getLastAttempt;
(apiDefault as any).getMeasurements = getMeasurements;
export default apiDefault;
