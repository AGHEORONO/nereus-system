import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div style={{
      minHeight: '100vh', overflowY: 'auto', overflowX: 'hidden',
      background: 'var(--color-bg)',
      backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(0,100,180,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(0,60,120,0.1) 0%, transparent 60%)',
      padding: '0 0 60px',
    }}>
      {/* Nav */}
      <div className="glass" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: 0 }}>
        <span style={{ fontSize: '20px' }}>🌊</span>
        <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--color-primary)', letterSpacing: '0.12em' }}>NEREUS</span>
        <div style={{ flex: 1 }} />
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button className="btn btn-primary" style={{ fontSize: '12px' }}>← Live Dashboard</button>
        </Link>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px 0' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🌊</div>
          <h1 style={{ fontSize: '42px', fontWeight: 800, color: 'var(--color-text-1)', marginBottom: '12px', lineHeight: 1.15 }}>
            The Nereus System
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--color-text-2)', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>
            An early-warning platform for water pollution detection using <strong style={{ color: 'var(--color-primary)' }}>Copernicus satellite imagery</strong> and <strong style={{ color: 'var(--color-primary)' }}>Galileo positioning</strong>.
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['CASSINI Hackathon', 'Space for Water', 'Challenge #2'].map(tag => (
              <span key={tag} className="badge badge-citizen" style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Pipeline diagram */}
        <Section title="📡 Data Pipeline" icon="🛰">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginTop: '16px' }}>
            {[
              { step: '01', title: 'Sentinel-2 L2A', desc: 'Copernicus Data Space Ecosystem pulls the latest cloud-free scene (≤20% cloud cover) over the target water body. 5-day repeat cycle.', color: '#a78bfa' },
              { step: '02', title: 'Band Extraction', desc: 'Bands B03 (Green), B04 (Red), B05 (Red-Edge 705nm) and B08 (NIR) are loaded at 10–20 m resolution.', color: '#00b4ff' },
              { step: '03', title: 'Index Computation', desc: 'NDWI masks water pixels. NDCI flags chlorophyll excess (algal blooms). B4/B3 ratio proxies turbidity / suspended sediment.', color: '#00e87a' },
              { step: '04', title: 'Anomaly Detection', desc: 'Pixels exceeding NDCI > 0 or turbidity > 1.15 within the water mask are grouped and area-weighted. Events > 2 ha create an Alert.', color: '#ff8c00' },
              { step: '05', title: 'Alert & Visualise', desc: 'Alerts are persisted to SQLite and pushed to the dashboard as heatmap tiles + marker pins. Severity is tiered LOW / MEDIUM / HIGH.', color: '#ff3b3b' },
            ].map(s => (
              <div key={s.step} className="glass" style={{ padding: '16px', borderLeft: `3px solid ${s.color}` }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: s.color, marginBottom: '6px', fontWeight: 700 }}>STEP {s.step}</div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-text-1)', marginBottom: '6px' }}>{s.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-2)', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Indices */}
        <Section title="📐 Spectral Indices" icon="📊">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {[
              {
                name: 'NDWI — Normalised Difference Water Index',
                formula: 'NDWI = (B03 − B08) / (B03 + B08)',
                desc: 'McFeeters (1996). Values > −0.1 indicate open water surface. Used as the water mask for all downstream indices.',
                color: '#00b4ff',
              },
              {
                name: 'NDCI — Normalised Difference Chlorophyll Index',
                formula: 'NDCI = (B05 − B04) / (B05 + B04)',
                desc: 'Mishra & Mishra (2012). Elevated values (> 0) indicate chlorophyll-a concentration, a proxy for cyanobacterial / algal blooms.',
                color: '#00e87a',
              },
              {
                name: 'Turbidity Proxy',
                formula: 'Turbidity = B04 / B03   (Red / Green ratio)',
                desc: 'Higher ratios indicate increased suspended particulate matter — characteristic of sediment runoff, industrial discharge, or flooding.',
                color: '#ff8c00',
              },
            ].map(idx => (
              <div key={idx.name} className="glass" style={{ padding: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-text-1)', marginBottom: '6px' }}>{idx.name}</div>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: idx.color, display: 'block', marginBottom: '8px', padding: '6px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
                  {idx.formula}
                </code>
                <div style={{ fontSize: '12px', color: 'var(--color-text-2)', lineHeight: 1.5 }}>{idx.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Copernicus & Galileo */}
        <Section title="🛸 Space Services Used" icon="🌍">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
            <div className="glass" style={{ padding: '20px', borderTop: '2px solid #a78bfa' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🛰</div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-1)', marginBottom: '6px' }}>Copernicus Programme</div>
              <ul style={{ fontSize: '12px', color: 'var(--color-text-2)', lineHeight: 1.7, paddingLeft: '16px' }}>
                <li>Sentinel-2 MSI — multispectral optical imagery</li>
                <li>Copernicus Data Space Ecosystem (CDSE)</li>
                <li>openEO Python API for cloud processing</li>
                <li>L2A (atmospherically corrected) products</li>
              </ul>
            </div>
            <div className="glass" style={{ padding: '20px', borderTop: '2px solid #00b4ff' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📡</div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-1)', marginBottom: '6px' }}>Galileo / GNSS</div>
              <ul style={{ fontSize: '12px', color: 'var(--color-text-2)', lineHeight: 1.7, paddingLeft: '16px' }}>
                <li>Browser Geolocation API (W3C)</li>
                <li>In Europe, defaults to Galileo satellites</li>
                <li>Sub-metre accuracy with SBAS correction</li>
                <li>Powers citizen report geotagging</li>
              </ul>
              <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--color-text-3)' }}>
                Phase 2: Galileo OSNMA authentication to verify report integrity
              </div>
            </div>
          </div>
        </Section>

        {/* Demo region */}
        <Section title="📍 Demo Region" icon="🗺">
          <div className="glass" style={{ padding: '20px', marginTop: '16px' }}>
            <div style={{ fontWeight: 700, color: 'var(--color-text-1)', marginBottom: '8px' }}>Bega Canal & Lacul Surduc — Timișoara, Romania</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-2)', lineHeight: 1.6 }}>
              The Bega canal supplies drinking water and supports biodiversity in the Timișoara metropolitan area.
              Industrial outfalls, agricultural runoff, and flash flooding events make it an ideal real-world testbed.
              Lacul Surduc (reservoir, ~40 km upstream) is monitored for eutrophication early indicators.
            </div>
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                'bbox: 21.20°E — 21.30°E',
                '45.74°N — 45.77°N',
                'Sentinel-2 tile: T34TFQ',
              ].map(tag => (
                <span key={tag} style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', background: 'var(--color-primary-dim)', padding: '3px 8px', borderRadius: '4px' }}>{tag}</span>
              ))}
            </div>
          </div>
        </Section>

        {/* What's next */}
        <Section title="🚀 Phase 2 Roadmap" icon="🔭">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '16px' }}>
            {[
              { icon: '🔐', text: 'Galileo OSNMA signature verification for tamper-proof citizen reports' },
              { icon: '📱', text: 'PWA / mobile app with offline report queue' },
              { icon: '🤖', text: 'CNN-based bloom segmentation on full Sentinel-2 scenes' },
              { icon: '⚙️', text: 'IoT water quality sensors streaming in-situ data' },
              { icon: '🔔', text: 'SMS / email alert dispatch to water authorities' },
              { icon: '🌍', text: 'Multi-basin support: Danube, Mureș, Siret' },
            ].map(item => (
              <div key={item.icon} className="glass" style={{ padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-2)', lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '48px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-1)', marginBottom: '4px' }}>{title}</h2>
      <div style={{ height: '2px', width: '48px', background: 'var(--color-primary)', borderRadius: '2px', marginBottom: '4px' }} />
      {children}
    </section>
  )
}
