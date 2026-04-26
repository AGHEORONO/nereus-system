'use client';

import React, { useState } from 'react';
import { X, Mail, MapPin, Bell } from 'lucide-react';
import { api } from '@/services/nereusApi';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscribeModal({ isOpen, onClose }: SubscribeModalProps) {
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [freq, setFreq] = useState('immediate');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.subscribe({ email, city, frequency: freq });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setEmail('');
        setCity('');
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'var(--trench)',
    border: '1.5px solid var(--shelf)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="glass-panel relative z-10 w-full max-w-md rounded-xl overflow-hidden" style={{ boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)' }}>
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[var(--glass-border)]">
          <div>
            <h2 className="font-display text-base font-bold text-text-primary">Subscribe to Alerts</h2>
            <p className="font-body text-[11px] text-text-muted mt-0.5">Get notified about water incidents</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer" style={{ background: 'var(--trench)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(0, 230, 118, 0.1)', color: '#00e676' }}>
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-text-primary">Subscribed!</h3>
            <p className="font-body text-sm text-text-muted mt-2">You will now receive alerts for {city}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-display font-bold text-text-muted uppercase tracking-[0.12em] mb-1.5">
                <Mail className="w-3 h-3" style={{ color: 'var(--gold-dim)' }} /> Email Address
              </label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg font-body text-sm focus:outline-none focus:border-[var(--gold)]" style={inputStyle} placeholder="you@example.com" />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-display font-bold text-text-muted uppercase tracking-[0.12em] mb-1.5">
                <MapPin className="w-3 h-3" style={{ color: 'var(--gold-dim)' }} /> City / Region
              </label>
              <input required type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg font-body text-sm focus:outline-none focus:border-[var(--gold)]" style={inputStyle} placeholder="e.g. Timisoara" />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-display font-bold text-text-muted uppercase tracking-[0.12em] mb-1.5">
                <Bell className="w-3 h-3" style={{ color: 'var(--gold-dim)' }} /> Frequency
              </label>
              <select value={freq} onChange={e => setFreq(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg font-body text-sm focus:outline-none focus:border-[var(--gold)] appearance-none" style={inputStyle}>
                <option value="immediate">Immediate (Real-time)</option>
                <option value="daily">Daily Digest</option>
              </select>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-display text-xs font-semibold cursor-pointer" style={{ background: 'var(--trench)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)' }}>Cancel</button>
              <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg font-display text-xs font-bold cursor-pointer" style={{ background: 'var(--gold)', color: 'var(--abyss)' }}>
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
