'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/nereusApi';
import Header from '@/components/Header';
import MapView from '@/components/MapView';
import { SatelliteLayerId } from '@/data/satelliteTypes';
import satelliteData from '@/data/satelliteData.json';

export default function DemoPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  
  // ML Sliders
  const [ndwi, setNdwi] = useState(0.5);
  const [ndci, setNdci] = useState(0.0);
  const [turbidity, setTurbidity] = useState(1.0);
  const [mlResult, setMlResult] = useState<any>(null);

  // Forms
  const [email, setEmail] = useState('');
  const [reportType, setReportType] = useState('Flood');
  const [reportDesc, setReportDesc] = useState('');

  const loadData = async () => {
    const fetchedAlerts = await api.getAlerts();
    const fetchedReports = await api.getReports();
    const fetchedZones = await api.getZones();
    const subs = await api.subscriberCount();
    
    let combined: any[] = [];
    if (fetchedAlerts) combined = [...fetchedAlerts];
    if (fetchedReports) {
      combined = [...combined, ...fetchedReports.map((r: any) => ({
        ...r, id: `rep-${r.id}`, isReport: true, type: 'Other', severity: 'low'
      }))];
    }
    setAlerts(combined);
    if (fetchedZones) setZones(fetchedZones);
    if (subs) setSubscriberCount(subs.count || 0);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    await api.triggerScan({ north: 45.8, south: 45.7, east: 21.3, west: 21.1 });
    await loadData();
    setIsScanning(false);
  };

  const handleML = async () => {
    const res = await api.analyzeML({ ndwi, ndci, turbidity });
    setMlResult(res);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.subscribe({ email, city: 'Timisoara', frequency: 'immediate' });
    setEmail('');
    loadData();
    alert('Subscribed!');
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.postReport({ type: reportType, description: reportDesc, lat: 45.74, lng: 21.20 });
    setReportDesc('');
    loadData();
    alert('Report submitted!');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--abyss)] text-white overflow-y-auto">
      <Header onSubmitReport={() => {}} onTriggerScan={handleScan} isScanning={isScanning} theme="dark" />
      
      <div className="flex-1 p-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
        
        {/* Column 1: Map & Case Study */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="h-[400px] rounded-xl overflow-hidden border border-[var(--glass-border)]">
            <MapView
              alerts={alerts}
              zones={zones}
              selectedAlertId={null}
              onSelectAlert={() => {}}
              activeLayer="ndwi"
              satelliteData={satelliteData as GeoJSON.FeatureCollection}
              center={{ lat: 45.7489, lng: 21.2087 }}
              theme="dark"
            />
          </div>
          
          <div className="glass-panel p-6 rounded-xl border border-[var(--glass-border)]">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--gold)' }}>Bega Case Study (2021-2025)</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              The Bega River has historically faced pollution spikes and flooding risks. This Nereus system demonstrates 
              real-time Earth Observation correlation with Galileo citizen reporting to preempt anomalies.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-[var(--trench)] rounded-lg">
                <h3 className="font-bold mb-1">Live Alerts</h3>
                <span className="text-3xl text-[var(--cyan)]">{alerts.length}</span>
              </div>
              <div className="p-4 bg-[var(--trench)] rounded-lg">
                <h3 className="font-bold mb-1">Subscribers</h3>
                <span className="text-3xl text-[var(--gold)]">{subscriberCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Controls */}
        <div className="flex flex-col gap-6">
          
          {/* ML Analyzer */}
          <div className="glass-panel p-6 rounded-xl border border-[var(--glass-border)]">
            <h2 className="text-lg font-bold mb-4 text-[var(--text-primary)]">ML Anomaly Layer</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[var(--text-muted)]">NDWI ({ndwi})</label>
                <input type="range" min="0" max="1" step="0.05" value={ndwi} onChange={e => setNdwi(parseFloat(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)]">NDCI ({ndci})</label>
                <input type="range" min="-1" max="1" step="0.1" value={ndci} onChange={e => setNdci(parseFloat(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)]">Turbidity ({turbidity})</label>
                <input type="range" min="0" max="5" step="0.1" value={turbidity} onChange={e => setTurbidity(parseFloat(e.target.value))} className="w-full" />
              </div>
              <button onClick={handleML} className="w-full py-2 bg-[var(--gold)] text-[var(--abyss)] rounded-lg font-bold">
                Run Isolation Forest
              </button>
              {mlResult && (
                <div className="p-3 bg-[var(--trench)] rounded mt-2 text-xs font-mono text-green-400">
                  {JSON.stringify(mlResult)}
                </div>
              )}
            </div>
          </div>

          {/* Inline Report Form */}
          <form onSubmit={handleReport} className="glass-panel p-6 rounded-xl border border-[var(--glass-border)]">
            <h2 className="text-lg font-bold mb-4 text-[var(--text-primary)]">Mock Report</h2>
            <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full p-2 mb-3 bg-[var(--trench)] border border-[var(--shelf)] rounded text-white">
              <option>Flood</option>
              <option>Leak</option>
              <option>Contamination</option>
            </select>
            <input value={reportDesc} onChange={e => setReportDesc(e.target.value)} placeholder="Description" required className="w-full p-2 mb-3 bg-[var(--trench)] border border-[var(--shelf)] rounded text-white" />
            <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold">Submit Galileo Report</button>
          </form>

          {/* Subscribe Form */}
          <form onSubmit={handleSubscribe} className="glass-panel p-6 rounded-xl border border-[var(--glass-border)]">
            <h2 className="text-lg font-bold mb-4 text-[var(--text-primary)]">Test Subscription</h2>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full p-2 mb-3 bg-[var(--trench)] border border-[var(--shelf)] rounded text-white" />
            <button type="submit" className="w-full py-2 bg-[var(--cyan)] text-[var(--abyss)] rounded-lg font-bold">Subscribe</button>
          </form>

        </div>
      </div>
    </div>
  );
}
