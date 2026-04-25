import { useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import NereusMap from '../components/Map/NereusMap'
import TimeSlider from '../components/Map/TimeSlider'
import AlertsPanel from '../components/AlertsPanel/AlertsPanel'
import ReportModal from '../components/ReportModal/ReportModal'
import Header from '../components/Header'
import LocationSearch from '../components/LocationSearch'
import { useNereusStore } from '../store/useNereusStore'
import { useAlerts, useReports, useHeatmap, useHealth, useScan } from '../hooks/useNereusQueries'
import type { BoundingBox } from '../types/geo'

// Last 5 Sentinel-2 pass dates (5-day repeat cycle, oldest → newest)
function last5Dates(): string[] {
  const dates: string[] = []
  const d = new Date()
  for (let i = 4; i >= 0; i--) {
    const dd = new Date(d)
    dd.setDate(dd.getDate() - i * 5)
    dates.push(dd.toISOString().slice(0, 10))
  }
  return dates
}
const DATES = last5Dates()

export default function Dashboard() {
  // Global UI state via zustand
  const {
    selectedLocation, locationBbox,
    setLocation, setLocationBbox,
    panelOpen, setPanelOpen,
    reportModalOpen, setReportModalOpen,
    dateIndex, setDateIndex,
    scanning, setScan, lastScanResult, setLastScanResult,
  } = useNereusStore()

  // TanStack Query data
  const { data: alerts = [], isError: alertsErr } = useAlerts()
  const { data: reports = [], isError: reportsErr } = useReports()
  const { data: heatmap = null } = useHeatmap(DATES[dateIndex])
  const { data: health } = useHealth()
  const scanMutation = useScan()

  // Defaults
  const cityName = selectedLocation?.name || 'Timișoara'
  const isTimisoara = cityName.toLowerCase().includes('timi') || cityName.toLowerCase().includes('bega')
  const activeBbox = locationBbox || { west: 21.15, south: 45.72, east: 21.35, north: 45.78 }

  const displayAlerts = isTimisoara ? alerts : []
  const displayReports = isTimisoara ? reports : []
  const displayHeatmap = isTimisoara ? heatmap : null
  const offline = alertsErr || reportsErr

  const handleScan = async () => {
    setScan(true)
    try {
      const result = await scanMutation.mutateAsync({
        ...activeBbox,
        start_date: DATES[0],
        end_date: DATES[DATES.length - 1],
      })
      setLastScanResult({
        scene_date: result.scene_date,
        scene_source: result.scene_source,
        alerts_created: result.alert_ids.length,
      })
    } finally {
      setScan(false)
    }
  }

  // Trigger scan on mount
  const hasScanned = useRef(false)
  useEffect(() => {
    if (!hasScanned.current) {
      handleScan()
      hasScanned.current = true
    }
  }, [])

  const handleSearchSelect = (name: string, center: { lat: number; lng: number }, bbox: BoundingBox) => {
    setLocation(name, center.lat, center.lng)
    setLocationBbox(bbox)
    hasScanned.current = false // Trigger new scan for new location
    handleScan()
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Full-bleed map */}
      <NereusMap
        alerts={displayAlerts}
        reports={displayReports}
        heatmap={displayHeatmap}
        cityBbox={activeBbox}
      />

      {/* Header */}
      <Header
        onSubmitReport={() => setReportModalOpen(true)}
        cityName={cityName}
        citySearchNode={<LocationSearch onSelect={handleSearchSelect} />}
      />

      {/* Offline badge */}
      {offline && (
        <div style={{
          position: 'absolute', top: '72px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 30, padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
          background: 'rgba(255,150,0,0.15)', border: '1px solid rgba(255,150,0,0.4)',
          color: '#ffaa00', fontWeight: 600,
        }}>
          ⚠ Showing cached demo data — backend offline
        </div>
      )}

      {/* Alerts sidebar */}
      {isTimisoara && (
        <AlertsPanel
          alerts={displayAlerts}
          reports={displayReports}
          loading={false}
          collapsed={!panelOpen}
          onToggle={() => setPanelOpen(!panelOpen)}
        />
      )}

      {/* Trigger Scan button */}
      <button
        id="trigger-scan-btn"
        onClick={handleScan}
        disabled={scanning}
        style={{
          position: 'absolute', top: '72px', right: '16px', zIndex: 30,
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 16px', borderRadius: '10px', cursor: scanning ? 'wait' : 'pointer',
          border: '1px solid rgba(0,229,255,0.3)',
          background: scanning
            ? 'rgba(0,229,255,0.05)'
            : 'linear-gradient(135deg, rgba(0,229,255,0.12), rgba(0,229,255,0.04))',
          color: scanning ? 'rgba(0,229,255,0.5)' : 'var(--cyan)',
          fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-display)',
          transition: 'all 0.2s',
        }}
      >
        {scanning ? (
          <>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
            Scanning…
          </>
        ) : (
          <> 🛰 Trigger Scan</>
        )}
      </button>

      {/* Last scan result toast */}
      {lastScanResult && !scanning && (
        <div style={{
          position: 'absolute', top: '118px', right: '16px', zIndex: 30,
          padding: '8px 14px', borderRadius: '8px', fontSize: '11px',
          background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.3)',
          color: '#00e676', maxWidth: '220px',
        }}>
          <div style={{ fontWeight: 700, marginBottom: '2px' }}>
            ✓ Scan complete — {lastScanResult.scene_date}
          </div>
          <div style={{ color: 'rgba(0,230,118,0.7)', fontSize: '10px' }}>
            {lastScanResult.alerts_created} new alert{lastScanResult.alerts_created !== 1 ? 's' : ''} •{' '}
            {lastScanResult.scene_source}
          </div>
        </div>
      )}

      {/* Copernicus + Galileo badges */}
      <div style={{
        position: 'absolute',
        top: lastScanResult && !scanning ? '170px' : '118px',
        right: '16px', zIndex: 20,
        display: 'flex', flexDirection: 'column', gap: '6px',
        transition: 'top 0.3s',
      }}>
        {[
          { icon: '🛰', text: 'Sentinel-2 L2A', sub: 'Copernicus CDSE' },
          { icon: '📡', text: 'Galileo GNSS', sub: 'Citizen reports' },
        ].map(b => (
          <div key={b.text} className="glass" style={{ padding: '6px 10px', fontSize: '11px' }}>
            <span style={{ marginRight: '6px' }}>{b.icon}</span>
            <span style={{ color: 'var(--color-text-1)', fontWeight: 600 }}>{b.text}</span>
            <div style={{ fontSize: '10px', color: 'var(--color-text-3)', marginTop: '1px' }}>{b.sub}</div>
          </div>
        ))}

        {/* Health indicator */}
        {health && (
          <div className="glass" style={{ padding: '6px 10px', fontSize: '11px' }}>
            <span style={{
              display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
              background: health.copernicus ? '#00e676' : '#ff8c00',
              boxShadow: `0 0 6px ${health.copernicus ? '#00e676' : '#ff8c00'}`,
              marginRight: '6px',
            }} />
            <span style={{ color: 'var(--color-text-1)', fontWeight: 600 }}>
              {health.copernicus ? 'CDSE Online' : 'Demo Mode'}
            </span>
            <div style={{ fontSize: '10px', color: 'var(--color-text-3)', marginTop: '1px' }}>
              {formatDistanceToNow(new Date(), { addSuffix: true }).replace('less than a minute ago', 'just now')}
            </div>
          </div>
        )}
      </div>

      {/* Pollution index legend */}
      <div className="glass" style={{
        position: 'absolute', bottom: '110px', right: '56px',
        padding: '10px 14px', zIndex: 20, minWidth: '160px',
      }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-3)', letterSpacing: '0.08em', marginBottom: '8px', textTransform: 'uppercase' }}>
          Pollution Index
        </div>
        {[
          { color: 'rgba(0,100,255,0.7)', label: 'Clean' },
          { color: 'rgba(0,220,200,0.7)', label: 'Low' },
          { color: 'rgba(255,200,0,0.85)', label: 'Medium' },
          { color: 'rgba(255,80,0,0.9)', label: 'High' },
          { color: 'rgba(255,0,50,1)', label: 'Critical' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '24px', height: '10px', background: color, borderRadius: '3px' }} />
            <span style={{ fontSize: '11px', color: 'var(--color-text-2)' }}>{label}</span>
          </div>
        ))}
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--color-border)', fontSize: '10px', color: 'var(--color-text-3)' }}>
          NDCI + Turbidity composite
        </div>
      </div>

      {/* Marker legend */}
      <div className="glass" style={{ position: 'absolute', bottom: '110px', right: '230px', padding: '10px 14px', zIndex: 20 }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-3)', letterSpacing: '0.08em', marginBottom: '8px', textTransform: 'uppercase' }}>
          Markers
        </div>
        {[
          { color: '#ff3b3b', label: 'HIGH alert' },
          { color: '#ff8c00', label: 'MEDIUM alert' },
          { color: '#f5d800', label: 'LOW alert' },
          { color: '#00b4ff', label: 'Citizen report' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
            <span style={{ fontSize: '11px', color: 'var(--color-text-2)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Time slider */}
      <TimeSlider dates={DATES} selectedIndex={dateIndex} onChange={setDateIndex} />

      {/* Report modal */}
      <ReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmitted={() => { setReportModalOpen(false) }}
      />
    </div>
  )
}
