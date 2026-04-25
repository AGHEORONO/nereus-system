/**
 * Typed fetch wrappers for the Nereus backend API.
 *
 * Exported async functions are used by TanStack Query hooks in hooks/.
 * Base URL from VITE_API_BASE_URL env var (defaults to same origin in prod).
 */

import type { Alert, CitizenReport, HeatmapCollection, ScanResponse } from '../types'

export const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

// ── Alerts ──────────────────────────────────────────────────────────────────

export async function getAlerts(limit = 50): Promise<Alert[]> {
  const res = await fetch(`${BASE}/api/alerts/?limit=${limit}`)
  return json<Alert[]>(res)
}

// ── Reports ──────────────────────────────────────────────────────────────────

export async function getReports(limit = 100): Promise<CitizenReport[]> {
  const res = await fetch(`${BASE}/api/reports/?limit=${limit}`)
  return json<CitizenReport[]>(res)
}

export interface ReportPayload {
  lat: number
  lon: number
  pollution_type: string
  description: string
  photo?: File
  gnss_accuracy_m?: number
  reporter_name?: string
}

export async function submitReport(payload: ReportPayload): Promise<CitizenReport> {
  const res = await fetch(`${BASE}/api/reports/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lat: payload.lat,
      lon: payload.lon,
      pollution_type: payload.pollution_type,
      description: payload.description,
      gnss_accuracy_m: payload.gnss_accuracy_m,
      reporter_name: payload.reporter_name,
    }),
  })
  return json<CitizenReport>(res)
}

// ── Heatmap ──────────────────────────────────────────────────────────────────

export async function getHeatmap(date: string): Promise<HeatmapCollection> {
  const res = await fetch(`${BASE}/api/heatmap/?date=${date}`)
  return json<HeatmapCollection>(res)
}

// ── Scan ─────────────────────────────────────────────────────────────────────

export interface ScanRequest {
  west?: number
  south?: number
  east?: number
  north?: number
  start_date?: string
  end_date?: string
}

export async function triggerScan(req: ScanRequest = {}): Promise<ScanResponse> {
  const res = await fetch(`${BASE}/api/scan/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  return json<ScanResponse>(res)
}

// ── Health ────────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string
  system: string
  version: string
  copernicus: boolean
  mode: string
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE}/api/health/`)
  return json<HealthResponse>(res)
}
