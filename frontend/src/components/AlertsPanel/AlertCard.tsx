import type { Alert } from '../../types'

interface Props {
  alert: Alert
  onClick?: () => void
}



const TYPE_ICON: Record<string, string> = {
  ALGAL_BLOOM: '🦠',
  TURBIDITY:   '🌊',
  CHEMICAL:    '⚗️',
  FOAM:        '🫧',
  OIL_SLICK:   '🛢️',
  OTHER:       '⚠️',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function AlertCard({ alert, onClick }: Props) {
  const icon = TYPE_ICON[alert.pollution_type] ?? '⚠️'
  const label = alert.pollution_type.replace(/_/g, ' ')

  return (
    <button
      id={`alert-card-${alert.id}`}
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        marginBottom: '8px',
        fontFamily: 'var(--font-sans)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.background = 'rgba(0,180,255,0.07)'
        el.style.borderColor = 'var(--color-primary)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.background = 'rgba(255,255,255,0.03)'
        el.style.borderColor = 'var(--color-border)'
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <span style={{ color: 'var(--color-text-1)', fontWeight: 600, fontSize: '13px', flex: 1 }}>
          {label}
        </span>
        <span className={`badge badge-${alert.severity.toLowerCase()}`}
          style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
          {alert.severity}
        </span>
      </div>

      {/* Source chip */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
        <span className={alert.source === 'satellite' ? 'badge badge-sat' : 'badge badge-citizen'}
          style={{ padding: '1px 6px', borderRadius: '3px', fontSize: '10px', fontWeight: 600 }}>
          {alert.source === 'satellite' ? '📡 Sentinel-2' : '🛰 Citizen'}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--color-text-3)' }}>
          {timeAgo(alert.timestamp)}
        </span>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
        {[
          { label: 'NDCI', value: alert.ndci_max.toFixed(3), color: alert.ndci_max > 0.1 ? 'var(--color-alert-high)' : 'var(--color-clean)' },
          { label: 'Turb.', value: alert.turbidity_max.toFixed(2), color: alert.turbidity_max > 1.2 ? 'var(--color-alert-med)' : 'var(--color-text-1)' },
          { label: 'Area', value: `${alert.area_ha}ha`, color: 'var(--color-text-1)' },
        ].map(m => (
          <div key={m.label} style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: '4px',
            padding: '4px 6px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '9px', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: m.color, fontFamily: 'var(--font-mono)' }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Scene date */}
      <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--color-text-3)' }}>
        Scene: {alert.scene_date} · {alert.lat.toFixed(4)}°N {alert.lon.toFixed(4)}°E
      </div>
    </button>
  )
}
