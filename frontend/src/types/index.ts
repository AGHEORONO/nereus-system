/** Shared TypeScript types mirroring the backend SQLModel schemas. */

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH'

export type PollutionType =
  | 'ALGAL_BLOOM'
  | 'TURBIDITY'
  | 'CHEMICAL'
  | 'FOAM'
  | 'OIL_SLICK'
  | 'OTHER'

export type AlertSource = 'satellite' | 'citizen'

export interface Alert {
  id: number
  timestamp: string   // ISO 8601
  lat: number
  lon: number
  ndci_max: number
  turbidity_max: number
  severity: Severity
  pollution_type: PollutionType
  area_ha: number
  source: AlertSource
  scene_date: string
  description: string
  // ML anomaly detection fields (optional, present when ML is active)
  ml_anomaly_score?: number | null
  ml_confidence?: number | null
  ml_pollution_type?: string | null
  ml_model?: string | null
}

export interface CitizenReport {
  id: number
  timestamp: string
  lat: number
  lon: number
  pollution_type: PollutionType
  description: string
  photo_url?: string | null
  reporter_name?: string | null
  image_data?: string | null
}

export interface HeatmapFeature {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: {
    ndci: number
    turbidity: number
    pollution: number
  }
}

export interface HeatmapCollection {
  type: 'FeatureCollection'
  features: HeatmapFeature[]
  date: string
}

export interface ScanResponse {
  scene_date: string
  scene_source: string
  heatmap: HeatmapCollection
  alert_ids: number[]
  statistics: {
    ndci_mean: number
    ndci_max: number
    turbidity_mean: number
    water_pixels: number
    anomaly_area_ha: number
  }
}
