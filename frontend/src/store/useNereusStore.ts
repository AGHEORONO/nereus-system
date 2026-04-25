/**
 * Zustand store for global UI state.
 * Keeps all ephemeral view state out of React component trees.
 */
import { create } from 'zustand'
import type { Alert, CitizenReport } from '../types'
import type { BoundingBox } from '../types/geo'

interface ScanResult {
  scene_date: string
  scene_source: string
  alerts_created: number
}

interface SelectedLocation {
  name: string
  lat: number
  lon: number
}

interface NereusStore {
  // Selected location (set by landing page or quick-pick)
  selectedLocation: SelectedLocation | null
  setLocation: (name: string, lat: number, lon: number) => void

  // Location bounding box
  locationBbox: BoundingBox | null
  setLocationBbox: (bbox: BoundingBox) => void

  // Panel state
  panelOpen: boolean
  setPanelOpen: (open: boolean) => void

  // Active alert / report (clicked marker)
  activeAlert: Alert | null
  setActiveAlert: (a: Alert | null) => void
  activeReport: CitizenReport | null
  setActiveReport: (r: CitizenReport | null) => void

  // Report modal
  reportModalOpen: boolean
  setReportModalOpen: (open: boolean) => void

  // Scan state
  scanning: boolean
  setScan: (scanning: boolean) => void
  lastScanResult: ScanResult | null
  setLastScanResult: (r: ScanResult | null) => void

  // Time slider date index
  dateIndex: number
  setDateIndex: (i: number) => void
}

export const useNereusStore = create<NereusStore>((set) => ({
  selectedLocation: null,
  setLocation: (name, lat, lon) => set({ selectedLocation: { name, lat, lon } }),

  locationBbox: null,
  setLocationBbox: (locationBbox) => set({ locationBbox }),

  panelOpen: true,
  setPanelOpen: (open) => set({ panelOpen: open }),

  activeAlert: null,
  setActiveAlert: (activeAlert) => set({ activeAlert, activeReport: null }),
  activeReport: null,
  setActiveReport: (activeReport) => set({ activeReport, activeAlert: null }),

  reportModalOpen: false,
  setReportModalOpen: (reportModalOpen) => set({ reportModalOpen }),

  scanning: false,
  setScan: (scanning) => set({ scanning }),
  lastScanResult: null,
  setLastScanResult: (lastScanResult) => set({ lastScanResult }),

  dateIndex: 4,
  setDateIndex: (dateIndex) => set({ dateIndex }),
}))
