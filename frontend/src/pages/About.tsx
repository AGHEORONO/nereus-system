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
        <img src="/logo-solid.png" alt="Nereus" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
        <div style={{ flex: 1 }} />
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <button className="btn btn-primary" style={{ fontSize: '12px' }}>← Live Dashboard</button>
        </Link>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px 0' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <img
            src="/logo-solid.png"
            alt="The Nereus System"
            style={{ height: '140px', width: 'auto', objectFit: 'contain', margin: '0 auto 20px', display: 'block', filter: 'drop-shadow(0 0 20px rgba(0,229,255,0.12))' }}
          />
          <p style={{ fontSize: '18px', color: 'var(--color-text-2)', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>
            An early-warning platform for water pollution detection using <strong style={{ color: 'var(--color-primary)' }}>Copernicus satellite imagery</strong> and <strong style={{ color: 'var(--color-primary)' }}>Galileo positioning</strong>.
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['CASSINI Hackathon', 'Space for Water', 'Challenge #2'].map(tag => (
              <span key={tag} className="badge badge-citizen" style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* Section 1 — How It Works: SVG Pipeline Diagram                */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <Section title="🛰 How It Works" icon="📡">
          <div style={{ marginTop: '20px', overflowX: 'auto' }}>
            <svg viewBox="0 0 900 120" style={{ width: '100%', minWidth: '700px', height: 'auto' }}>
              {/* Definitions */}
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#00e5ff" />
                </marker>
                <linearGradient id="boxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(0,229,255,0.12)" />
                  <stop offset="100%" stopColor="rgba(0,229,255,0.04)" />
                </linearGradient>
              </defs>

              {/* Pipeline boxes */}
              {[
                { x: 0,   label: 'Sentinel-2',    sub: 'Satellite',          color: '#a78bfa' },
                { x: 145, label: 'Copernicus',     sub: 'Data Space',         color: '#7c8aff' },
                { x: 290, label: 'openEO',         sub: 'Processing',         color: '#00b4ff' },
                { x: 435, label: 'Spectral Index', sub: 'NDWI · NDCI · Turb', color: '#00e87a' },
                { x: 580, label: 'Anomaly',        sub: 'Detection',          color: '#ff8c00' },
                { x: 725, label: 'Alert',          sub: 'Authorities & Citizens', color: '#ff3b3b' },
              ].map((box, i, arr) => (
                <g key={box.label}>
                  {/* Box */}
                  <rect
                    x={box.x} y={20} width={120} height={70} rx={8}
                    fill="url(#boxGrad)"
                    stroke={box.color} strokeWidth={1.5}
                  />
                  {/* Colored top accent */}
                  <rect x={box.x} y={20} width={120} height={3} rx={1.5} fill={box.color} />
                  {/* Label */}
                  <text x={box.x + 60} y={52} textAnchor="middle" fill="#e2f0ff" fontSize="12" fontWeight="700" fontFamily="Inter, sans-serif">
                    {box.label}
                  </text>
                  <text x={box.x + 60} y={72} textAnchor="middle" fill="#7aa8cc" fontSize="10" fontFamily="Inter, sans-serif">
                    {box.sub}
                  </text>
                  {/* Arrow to next */}
                  {i < arr.length - 1 && (
                    <line
                      x1={box.x + 124} y1={55} x2={arr[i + 1].x - 4} y2={55}
                      stroke="#00e5ff" strokeWidth={1.5} markerEnd="url(#arrowhead)"
                      opacity={0.6}
                    />
                  )}
                </g>
              ))}
            </svg>
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* Case Study — Why Nereus Exists                                 */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <Section title="⚠️ A Real Problem on the Bega" icon="🐟">
          <div className="glass" style={{
            marginTop: '16px', padding: '24px', borderLeft: '4px solid #ff6b35',
            background: 'linear-gradient(135deg, rgba(255,107,53,0.06) 0%, rgba(255,60,60,0.02) 100%)',
          }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                color: '#ff6b35', background: 'rgba(255,107,53,0.12)', padding: '3px 10px',
                borderRadius: '4px', border: '1px solid rgba(255,107,53,0.25)',
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>Documented Event</span>
              <span style={{
                fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                color: '#7aa8cc', background: 'rgba(122,168,204,0.1)', padding: '3px 10px',
                borderRadius: '4px', border: '1px solid rgba(122,168,204,0.15)',
              }}>Tion.ro · Radio Reșița · Garda de Mediu Timiș · ABA Banat</span>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--color-text-1)', lineHeight: 1.7, margin: '0 0 14px' }}>
              On <strong style={{ color: '#ff6b35' }}>July 5, 2021</strong> and again on <strong style={{ color: '#ff6b35' }}>July 11, 2025</strong>, residents
              of Timișoara filmed dead fish floating on the Bega river. The culprit: heavy rainfall had overwhelmed the
              AQUATIM wastewater treatment plant, triggering emergency pumps that discharged untreated sewage directly
              into the canal.
            </p>
            <p style={{ fontSize: '14px', color: 'var(--color-text-2)', lineHeight: 1.7, margin: '0 0 14px' }}>
              By the time Garda de Mediu and ABA Banat arrived to take water samples, over <strong style={{ color: '#ff3b3b' }}>20 hours</strong> had
              passed. The pollution was already undetectable. No one was held accountable. The same event happened again
              four years later.
            </p>

            <div className="glass" style={{
              padding: '16px', borderLeft: '3px solid #00e87a',
              background: 'rgba(0,232,122,0.04)',
            }}>
              <div style={{ fontSize: '11px', color: '#00e87a', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
                What Nereus would have done
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-1)', lineHeight: 1.6, margin: 0 }}>
                Nereus would have detected the turbidity and dissolved oxygen anomaly within the next Sentinel-2
                overpass — typically within <strong style={{ color: '#00e87a' }}>1–3 days</strong> — and issued an automated alert to both authorities
                and citizens. Early warning means early intervention. The fish don't have to die first.
              </p>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                'AQUATIM discharge point → Sânmihai Românesc → Otelec (Serbian border)',
                '~40 km affected stretch',
                '114 km total Bega canal length',
              ].map(tag => (
                <span key={tag} style={{
                  fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)',
                  background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>{tag}</span>
              ))}
            </div>
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* Section 2 — Data Sources Table                                 */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <Section title="📊 Data Sources" icon="📐">
          <div className="glass" style={{ marginTop: '16px', overflowX: 'auto', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(0,229,255,0.15)' }}>
                  {['Satellite', 'Product', 'Bands Used', 'Index', 'Detects'].map(h => (
                    <th key={h} style={{
                      padding: '12px 14px', textAlign: 'left', fontWeight: 700,
                      color: 'var(--color-primary)', fontSize: '11px',
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      fontFamily: 'var(--font-mono)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { sat: 'Sentinel-2 MSI', prod: 'L2A', bands: 'B03, B08',   idx: 'NDWI',            detects: 'Water body extent and changes',            color: '#00b4ff' },
                  { sat: 'Sentinel-2 MSI', prod: 'L2A', bands: 'B04, B05',   idx: 'NDCI',            detects: 'Algal blooms, chlorophyll concentration',  color: '#00e87a' },
                  { sat: 'Sentinel-2 MSI', prod: 'L2A', bands: 'B03, B04',   idx: 'Turbidity ratio', detects: 'Sediment, chemical discharge',             color: '#ff8c00' },
                  { sat: 'Galileo GNSS',   prod: 'Positioning signal', bands: '—', idx: '—',         detects: 'Authenticated geolocation of citizen reports', color: '#a78bfa' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-1)', fontWeight: 600 }}>{row.sat}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-2)' }}>{row.prod}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: row.color, fontSize: '12px' }}>{row.bands}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: row.color }}>{row.idx}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-2)', fontSize: '12px' }}>{row.detects}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* Original detailed pipeline cards                               */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <Section title="⚙️ Data Pipeline Details" icon="🛰">
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

        {/* Spectral Indices */}
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

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* Section 3 — Impact                                             */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <Section title="🎯 Impact" icon="🏛">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            {/* Who uses this */}
            <div className="glass" style={{ padding: '20px', borderTop: '2px solid #00e87a' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-1)', marginBottom: '12px' }}>
                Who uses this
              </div>
              <ul style={{ fontSize: '13px', color: 'var(--color-text-2)', lineHeight: 1.8, paddingLeft: '16px', margin: 0 }}>
                <li><strong style={{ color: 'var(--color-text-1)' }}>ANAR</strong> (Administrația Națională Apele Române) — national water authority</li>
                <li><strong style={{ color: 'var(--color-text-1)' }}>Garda de Mediu</strong> — environmental enforcement</li>
                <li><strong style={{ color: 'var(--color-text-1)' }}>Local municipalities</strong> along monitored waterways</li>
                <li><strong style={{ color: 'var(--color-text-1)' }}>Citizens</strong> living near water bodies</li>
              </ul>
            </div>

            {/* What an alert enables */}
            <div className="glass" style={{ padding: '20px', borderTop: '2px solid #ff8c00' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-1)', marginBottom: '12px' }}>
                What an alert enables
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-2)', lineHeight: 1.7 }}>
                <p style={{ margin: '0 0 12px' }}>
                  Intervention within <strong style={{ color: '#00e87a' }}>hours</strong> instead of <strong style={{ color: '#ff3b3b' }}>days</strong>.
                </p>
                <div className="glass" style={{ padding: '14px', borderLeft: '3px solid #ff8c00', background: 'rgba(255,140,0,0.05)' }}>
                  <div style={{ fontSize: '11px', color: '#ff8c00', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
                    Cost of a missed event
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-1)' }}>
                    €50,000 – €500,000
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-3)', marginTop: '4px' }}>
                    in cleanup + ecosystem damage per industrial pollution event in Romania
                  </div>
                </div>
              </div>
            </div>
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

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* Section 4 — Future Work                                        */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <Section title="🚀 Future Work" icon="🔭">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '16px' }}>
            {[
              { icon: '⚙️', text: 'Physical in-water IoT sensors for ground truth validation' },
              { icon: '🔐', text: 'Galileo OSNMA authenticated positioning (cryptographically verified coordinates)' },
              { icon: '🤖', text: 'ML classification of pollution type from spectral signature' },
              { icon: '🔗', text: 'Direct API integration with ANAR monitoring dashboard' },
              { icon: '🛰', text: 'Sentinel-1 SAR for oil slick detection regardless of cloud cover' },
              { icon: '📱', text: 'PWA / mobile app with offline report queue' },
              { icon: '🔔', text: 'SMS / email alert dispatch to water authorities' },
              { icon: '🌍', text: 'Multi-basin support: Danube, Mureș, Siret' },
            ].map(item => (
              <div key={item.text} className="glass" style={{ padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
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
