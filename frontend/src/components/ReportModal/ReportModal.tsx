import { useRef, useState } from 'react'
import { submitReport } from '../../api/client'
import type { PollutionType } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  onSubmitted: () => void
}

const POLLUTION_TYPES: { value: PollutionType; label: string; icon: string }[] = [
  { value: 'ALGAL_BLOOM', label: 'Algal Bloom',    icon: '🦠' },
  { value: 'TURBIDITY',   label: 'Turbidity',       icon: '🌊' },
  { value: 'CHEMICAL',    label: 'Chemical Spill',  icon: '⚗️' },
  { value: 'FOAM',        label: 'Foam / Surfactant', icon: '🫧' },
  { value: 'OIL_SLICK',  label: 'Oil Slick',       icon: '🛢️' },
  { value: 'OTHER',       label: 'Other',            icon: '⚠️' },
]

export default function ReportModal({ open, onClose, onSubmitted }: Props) {
  const [lat, setLat] = useState<number | null>(null)
  const [lon, setLon] = useState<number | null>(null)
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [type, setType] = useState<PollutionType>('OTHER')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  function getLocation() {
    setGpsStatus('loading')
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(pos.coords.latitude)
        setLon(pos.coords.longitude)
        setGpsStatus('ok')
      },
      () => setGpsStatus('error'),
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (lat === null || lon === null) { setError('Please acquire GPS coordinates first.'); return }
    if (!description.trim()) { setError('Please enter a description.'); return }
    setSubmitting(true)
    setError(null)
    try {
      await submitReport({ lat, lon, pollution_type: type, description, photo: photo ?? undefined })
      onSubmitted()
      onClose()
      setLat(null); setLon(null); setGpsStatus('idle')
      setDescription(''); setPhoto(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    /* Backdrop */
    <div
      id="report-modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(5,13,26,0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        className="glass animate-slide-in-up"
        onClick={e => e.stopPropagation()}
        style={{ width: 'min(480px, calc(100vw - 32px))', padding: '24px', position: 'relative' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-1)' }}>
              Report Pollution
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-3)', marginTop: '2px' }}>
              Ground-truth data helps validate satellite detections
            </p>
          </div>
          <button className="btn btn-ghost" onClick={onClose} id="modal-close-btn"
            style={{ padding: '6px 10px' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Galileo GPS section */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-2)', marginBottom: '6px', display: 'block' }}>
              📡 Location — Galileo/GNSS Positioning
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button type="button" id="get-gps-btn" className="btn btn-ghost"
                onClick={getLocation} style={{ fontSize: '12px' }}>
                {gpsStatus === 'loading' ? '⏳ Acquiring…' : '🛰 Get My Location'}
              </button>
              {gpsStatus === 'ok' && lat !== null && lon !== null && (
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                  ✓ {lat.toFixed(5)}°N {lon.toFixed(5)}°E
                </span>
              )}
              {gpsStatus === 'error' && (
                <span style={{ fontSize: '11px', color: 'var(--color-alert-high)' }}>
                  GPS unavailable
                </span>
              )}
            </div>
            <p style={{ fontSize: '10px', color: 'var(--color-text-3)', marginTop: '4px' }}>
              Uses browser Geolocation API backed by GNSS (Galileo constellation in Europe)
            </p>
          </div>

          {/* Pollution type */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-2)', marginBottom: '6px', display: 'block' }}>
              Pollution Type
            </label>
            <select id="pollution-type-select" className="select" value={type}
              onChange={e => setType(e.target.value as PollutionType)}>
              {POLLUTION_TYPES.map(pt => (
                <option key={pt.value} value={pt.value}>{pt.icon} {pt.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-2)', marginBottom: '6px', display: 'block' }}>
              Description
            </label>
            <textarea id="report-description" className="textarea" value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what you observed — colour, odour, extent, any visible sources…"
            />
          </div>

          {/* Photo upload */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-2)', marginBottom: '6px', display: 'block' }}>
              Photo (optional)
            </label>
            <input ref={fileRef} type="file" accept="image/*" id="photo-upload"
              onChange={e => setPhoto(e.target.files?.[0] ?? null)}
              style={{ display: 'none' }} />
            <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}
              style={{ fontSize: '12px' }}>
              📷 {photo ? photo.name : 'Attach photo'}
            </button>
          </div>

          {error && (
            <p style={{ fontSize: '12px', color: 'var(--color-alert-high)', background: 'rgba(255,59,59,0.08)',
              padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,59,59,0.3)' }}>
              {error}
            </p>
          )}

          <button type="submit" id="submit-report-btn" className="btn btn-primary"
            disabled={submitting} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {submitting ? '⏳ Submitting…' : '🚀 Submit Report'}
          </button>
        </form>
      </div>
    </div>
  )
}
