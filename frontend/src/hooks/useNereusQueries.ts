/**
 * TanStack Query hooks for all Nereus API endpoints.
 * Falls back to static seed data when the backend is unreachable.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAlerts, getReports, getHeatmap, triggerScan, getHealth, submitReport, upvoteReport, downvoteReport } from '../api/client'
import { FALLBACK_ALERTS, FALLBACK_REPORTS } from '../data/fallback'
import type { ScanRequest, ReportPayload } from '../api/client'
import type { BoundingBox } from '../types/geo'

// ── Alerts ───────────────────────────────────────────────────────────────────

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => getAlerts(50),
    refetchInterval: 30_000,
    placeholderData: FALLBACK_ALERTS,
    retry: 2,
  })
}

// ── Reports ──────────────────────────────────────────────────────────────────

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: () => getReports(100),
    refetchInterval: 30_000,
    placeholderData: FALLBACK_REPORTS,
    retry: 2,
  })
}

// ── Heatmap ──────────────────────────────────────────────────────────────────

export function useHeatmap(date: string, bbox?: BoundingBox | null) {
  return useQuery({
    queryKey: ['heatmap', date, bbox],
    queryFn: () => getHeatmap(date, bbox ?? undefined),
    staleTime: 5 * 60_000,
    retry: 1,
    enabled: !!bbox,
  })
}

// ── Voting ───────────────────────────────────────────────────────────────────

export function useUpvoteReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => upvoteReport(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useDownvoteReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => downvoteReport(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

// ── Health ────────────────────────────────────────────────────────────────────

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    refetchInterval: 60_000,
    retry: 1,
  })
}

// ── Scan ─────────────────────────────────────────────────────────────────────

export function useScan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: ScanRequest) => triggerScan(req),
    onSuccess: () => {
      // Invalidate alerts + heatmap so map refreshes automatically
      void qc.invalidateQueries({ queryKey: ['alerts'] })
      void qc.invalidateQueries({ queryKey: ['heatmap'] })
    },
  })
}

// ── Submit Report ─────────────────────────────────────────────────────────────

export function useSubmitReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ReportPayload) => submitReport(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}
