import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Alert, CitizenReport, HeatmapCollection } from '../../types'
import type { BoundingBox } from '../../types/geo'
import { useNereusStore } from '../../store/useNereusStore'

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

// Demo centre: Bega canal, Timișoara
const CENTER: [number, number] = [21.23, 45.752]
const ZOOM = 13

interface Props {
  alerts: Alert[]
  reports: CitizenReport[]
  heatmap: HeatmapCollection | null
  cityBbox?: BoundingBox
  localReports?: CitizenReport[]
}

export default function NereusMap({ alerts, reports, heatmap, cityBbox, localReports = [] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const alertMarkersRef = useRef<{id: number, marker: maplibregl.Marker}[]>([])
  const reportMarkersRef = useRef<{id: number, marker: maplibregl.Marker}[]>([])
  const localReportMarkersRef = useRef<maplibregl.Marker[]>([])

  // ── Init map ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: CENTER,
      zoom: ZOOM,
      maxZoom: 18,
      minZoom: 5,
    })

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')

    map.on('moveend', () => {
      const bounds = map.getBounds()
      useNereusStore.getState().setViewportBbox({
        west: bounds.getWest(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        north: bounds.getNorth(),
      })
    })

    map.on('load', () => {
      // Set initial viewport bounding box
      const bounds = map.getBounds()
      useNereusStore.getState().setViewportBbox({
        west: bounds.getWest(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        north: bounds.getNorth(),
      })

      if (!cityBbox) {
        addWaterBodyLayer(map)
      }
    })
    
    // Hide back button on manual pan
    map.on('dragstart', () => {
      useNereusStore.getState().clearBackBtn()
    })

    mapRef.current = map
    useNereusStore.getState().setMapRef(map)
    
    return () => { 
      map.remove()
      mapRef.current = null 
      useNereusStore.getState().setMapRef(null)
    }
  }, [])

  // ── Handle Bounding Box ──────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !cityBbox) return

    map.fitBounds([
      [cityBbox.west, cityBbox.south],
      [cityBbox.east, cityBbox.north]
    ], { padding: 50, duration: 2000 })
  }, [cityBbox])

  // ── Heatmap layer ────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !heatmap) return

    const updateLayer = () => {
      if (map.getSource('heatmap-source')) {
        (map.getSource('heatmap-source') as maplibregl.GeoJSONSource).setData(heatmap)
        return
      }

      map.addSource('heatmap-source', { type: 'geojson', data: heatmap })

      // Heatmap density layer
      map.addLayer({
        id: 'heatmap-layer',
        type: 'heatmap',
        source: 'heatmap-source',
        paint: {
          'heatmap-weight': ['get', 'pollution'],
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,255,0)',
            0.2, 'rgba(0,180,255,0.4)',
            0.5, 'rgba(245,216,0,0.6)',
            0.8, 'rgba(255,140,0,0.8)',
            1, 'rgba(255,59,59,0.9)'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 10, 15, 15, 40],
          'heatmap-opacity': 0.8
        }
      })
    }

    if (map.isStyleLoaded()) updateLayer()
    else map.once('styledata', updateLayer)
  }, [heatmap])

  // ── Alert markers (from API) ─────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    alertMarkersRef.current.forEach(m => m.marker.remove())
    alertMarkersRef.current = []

    alerts.forEach(alert => {
      const el = document.createElement('div')
      el.style.cssText = `
        width:16px; height:16px; border-radius:50%;
        background:${severityColor(alert.severity)};
        border:2px solid #fff;
        cursor:pointer;
        box-shadow:0 0 8px ${severityColor(alert.severity)};
      `

      const popup = new maplibregl.Popup({ offset: 12 }).setHTML(popupHtml(alert))

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([alert.lon, alert.lat])
        .setPopup(popup)
        .addTo(map)

      alertMarkersRef.current.push({ id: alert.id, marker })
    })
  }, [alerts])

  // ── Report markers (from API) ───────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    reportMarkersRef.current.forEach(m => m.marker.remove())
    reportMarkersRef.current = []

    reports.forEach(report => {
      const el = document.createElement('div')
      el.style.cssText = `
        width:14px; height:14px; border-radius:50%;
        background:#00b4ff;
        border:2px solid #fff;
        cursor:pointer;
        box-shadow:0 0 8px #00b4ff;
      `

      const popup = new maplibregl.Popup({ offset: 12 }).setHTML(reportPopupHtml(report))

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([report.lon, report.lat])
        .setPopup(popup)
        .addTo(map)

      reportMarkersRef.current.push({ id: report.id, marker })
    })
  }, [reports])

  // ── Handle popup opening on selection ────────────────────────────────────
  const selectedItemId = useNereusStore(s => s.selectedItemId)
  useEffect(() => {
    if (!selectedItemId) return

    const alertMatch = alertMarkersRef.current.find(m => m.id === selectedItemId)
    if (alertMatch) {
      const popup = alertMatch.marker.getPopup()
      if (popup && !popup.isOpen()) alertMatch.marker.togglePopup()
    }

    const reportMatch = reportMarkersRef.current.find(m => m.id === selectedItemId)
    if (reportMatch) {
      const popup = reportMatch.marker.getPopup()
      if (popup && !popup.isOpen()) reportMatch.marker.togglePopup()
    }
  }, [selectedItemId])

  // ── Local (just-submitted) report markers with green glow ───────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    localReportMarkersRef.current.forEach(m => m.remove())
    localReportMarkersRef.current = []

    localReports.forEach(report => {
      const el = document.createElement('div')
      el.style.cssText = `
        width:16px; height:16px; border-radius:50%;
        background:#00e676;
        border:2px solid #fff;
        cursor:pointer;
        box-shadow:0 0 12px #00e676;
      `

      const popup = new maplibregl.Popup({ offset: 12 }).setHTML(`
        <div style="font-family:Inter,sans-serif;font-size:13px;min-width:180px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <span style="font-weight:700;font-size:14px;color:#e2f0ff">Your Report</span>
            <span style="padding:2px 6px;border-radius:4px;font-size:9px;font-weight:700;
              background:rgba(0,230,118,0.15);color:#00e676;border:1px solid rgba(0,230,118,0.3)">JUST NOW</span>
          </div>
          <div style="color:#00e676;margin-bottom:4px;font-size:11px">
            Galileo/GNSS • ${new Date(report.timestamp).toLocaleTimeString()}
          </div>
          <div style="color:#e2f0ff;margin-bottom:4px">⚠ ${report.pollution_type.replace(/_/g, ' ')}</div>
          <div style="color:#7aa8cc;font-size:12px">${report.description}</div>
        </div>
      `)

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([report.lon, report.lat])
        .setPopup(popup)
        .addTo(map)

      localReportMarkersRef.current.push(marker)
    })
  }, [localReports])

  // ── Historical case-study markers (hardcoded demo overlay) ──────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const historicalEvents = [
      {
        lat: 45.7270, lon: 21.5790,
        label: 'July 2021 — AQUATIM overflow event',
        popup: 'Untreated sewage discharge detected. Fish mortality reported downstream. Garda de Mediu confirmed 20+ hour response delay.',
        date: '2021-07-05',
      },
      {
        lat: 45.7210, lon: 21.6050,
        label: 'July 2025 — Recurring overflow event',
        popup: 'Same discharge pattern repeated. Heavy rainfall overwhelmed treatment capacity. ABA Banat and Garda de Mediu deployed emergency response.',
        date: '2025-07-11',
      },
    ]

    const onReady = () => {
      historicalEvents.forEach(evt => {
        const el = document.createElement('div')
        el.style.cssText = `
          width:20px; height:20px; border-radius:50%;
          background:rgba(255,107,53,0.25);
          border:2px dashed #ff6b35;
          cursor:pointer;
          box-shadow:0 0 8px rgba(255,107,53,0.3);
          display:flex; align-items:center; justify-content:center;
        `
        // Inner dot
        const dot = document.createElement('div')
        dot.style.cssText = `
          width:8px; height:8px; border-radius:50%;
          background:#ff6b35;
        `
        el.appendChild(dot)

        const popup = new maplibregl.Popup({ offset: 14, maxWidth: '260px' }).setHTML(`
          <div style="font-family:Inter,sans-serif;font-size:13px;min-width:200px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <span style="font-weight:700;font-size:13px;color:#e2f0ff">${evt.label}</span>
            </div>
            <div style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;
              background:rgba(255,107,53,0.12);color:#ff6b35;border:1px solid rgba(255,107,53,0.3);
              margin-bottom:8px;letter-spacing:0.05em">HISTORICAL EVENT</div>
            <div style="color:#7aa8cc;margin-bottom:4px;font-size:11px">📅 ${evt.date}</div>
            <div style="color:#e2f0ff;margin-bottom:4px">⚠ Turbidity — HIGH</div>
            <div style="color:#7aa8cc;font-size:12px;line-height:1.5">${evt.popup}</div>
          </div>
        `)

        new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([evt.lon, evt.lat])
          .setPopup(popup)
          .addTo(map)
      })
    }

    if (map.isStyleLoaded()) {
      onReady()
    } else {
      map.once('load', onReady)
    }
  }, [])

  const showBackBtn = useNereusStore(s => s.showBackBtn)
  const prevViewport = useNereusStore(s => s.prevViewport)
  const clearBackBtn = useNereusStore(s => s.clearBackBtn)

  const handleBackToOverview = () => {
    if (mapRef.current && prevViewport) {
      mapRef.current.flyTo({
        center: prevViewport.center,
        zoom: prevViewport.zoom,
        duration: 1000,
        essential: true
      })
      clearBackBtn()
      useNereusStore.getState().setSelectedItemId(null)
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        id="nereus-map"
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      />
      {showBackBtn && (
        <button
          onClick={handleBackToOverview}
          className="glass-panel"
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 10,
            border: '1px solid var(--color-border)',
            background: 'rgba(0,0,0,0.6)'
          }}
        >
          ← Back to overview
        </button>
      )}
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function addWaterBodyLayer(map: maplibregl.Map) {
  // Fetch the local GeoJSON for the Bega canal + Lacul Surduc
  map.addSource('water-body', {
    type: 'geojson',
    data: '/geojson/bega_surduc.geojson',
  })

  map.addLayer({
    id: 'water-fill',
    type: 'fill',
    source: 'water-body',
    paint: {
      'fill-color': '#00b4ff',
      'fill-opacity': 0.12,
    },
  })

  map.addLayer({
    id: 'water-outline',
    type: 'line',
    source: 'water-body',
    paint: {
      'line-color': '#00b4ff',
      'line-width': 2,
      'line-opacity': 0.7,
    },
  })
}

function severityColor(s: string): string {
  if (s === 'HIGH') return '#ff3b3b'
  if (s === 'MEDIUM') return '#ff8c00'
  return '#f5d800'
}

function pollutionLabel(t: string): string {
  return t.replace(/_/g, ' ')
}

function popupHtml(a: Alert): string {
  const aiBadge = a.ml_confidence != null 
    ? `<span style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;background:rgba(180,0,255,0.15);color:#d946ef;border:1px solid rgba(217,70,239,0.3)">AI ${a.ml_confidence}%</span>`
    : ''

  return `
    <div style="font-family:Inter,sans-serif;font-size:13px;min-width:200px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-weight:700;font-size:14px;color:#e2f0ff">Satellite Alert</span>
        <span style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;
          background:${severityColor(a.severity)}22;color:${severityColor(a.severity)};
          border:1px solid ${severityColor(a.severity)}66">${a.severity}</span>
        ${aiBadge}
      </div>
      <div style="color:#7aa8cc;margin-bottom:4px">📡 ${a.scene_date}</div>
      <div style="color:#e2f0ff;margin-bottom:4px">⚠ ${pollutionLabel(a.pollution_type)}</div>
      <div style="color:#7aa8cc;font-size:12px;margin-bottom:6px">${a.description}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;font-family:'JetBrains Mono',monospace">
        <div style="background:rgba(255,255,255,0.05);padding:4px 8px;border-radius:4px">
          <div style="color:#4a7a9b">NDCI</div>
          <div style="color:#00e87a;font-weight:600">${a.ndci_max.toFixed(3)}</div>
        </div>
        <div style="background:rgba(255,255,255,0.05);padding:4px 8px;border-radius:4px">
          <div style="color:#4a7a9b">Turbidity</div>
          <div style="color:#f5d800;font-weight:600">${a.turbidity_max.toFixed(3)}</div>
        </div>
        <div style="background:rgba(255,255,255,0.05);padding:4px 8px;border-radius:4px">
          <div style="color:#4a7a9b">Area</div>
          <div style="color:#e2f0ff;font-weight:600">${a.area_ha} ha</div>
        </div>
        <div style="background:rgba(255,255,255,0.05);padding:4px 8px;border-radius:4px">
          <div style="color:#4a7a9b">Coords</div>
          <div style="color:#e2f0ff;font-weight:600">${a.lat.toFixed(4)}, ${a.lon.toFixed(4)}</div>
        </div>
      </div>
    </div>
  `
}

function reportPopupHtml(r: CitizenReport): string {
  return `
    <div style="font-family:Inter,sans-serif;font-size:13px;min-width:180px">
      <div style="font-weight:700;font-size:14px;color:#e2f0ff;margin-bottom:6px">
        🛰 Citizen Report
      </div>
      <div style="color:#00b4ff;margin-bottom:4px;font-size:11px">
        Galileo/GNSS • ${new Date(r.timestamp).toLocaleDateString()}
      </div>
      <div style="color:#e2f0ff;margin-bottom:4px">⚠ ${pollutionLabel(r.pollution_type)}</div>
      <div style="color:#7aa8cc;font-size:12px">${r.description}</div>
    </div>
  `
}
