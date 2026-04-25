import React from 'react';
import { Link } from 'react-router-dom';
import { FileUp, Globe, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  onSubmitReport: () => void;
  citySearchNode?: React.ReactNode;
  cityName?: string;
}

export default function Header({ onSubmitReport, citySearchNode, cityName = 'Timișoara' }: HeaderProps) {
  const { t, language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ro' : 'en');
  };

  return (
    <header
      id="main-header"
      className="glass-panel fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
      style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}
    >
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <img
          src="/logo-solid.png"
          alt="The Nereus System"
          style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
        />
      </Link>

      <div className="hidden md:flex items-center gap-4">
        {citySearchNode ? (
          <div className="w-64">
            {citySearchNode}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{
                background: 'var(--green)',
                boxShadow: '0 0 6px rgba(0, 230, 118, 0.5)',
              }}
            />
            <span className="font-body">{t('system.operational')}</span>
            <span className="mx-2 opacity-30">│</span>
            <span className="font-body opacity-60">{cityName} Region</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Link to="/about" style={{ textDecoration: 'none' }}>
          <button
            className="flex items-center justify-center h-10 px-3 rounded-lg transition-colors hover:bg-[rgba(0,229,255,0.05)] cursor-pointer gap-2"
            style={{ border: '1px solid var(--glass-border)' }}
            aria-label="About"
          >
            <Info className="w-4 h-4 text-cyan" />
            <span className="font-display text-xs font-semibold text-cyan">About</span>
          </button>
        </Link>

        <button
          onClick={toggleLanguage}
          className="flex items-center justify-center h-10 px-3 rounded-lg transition-colors hover:bg-[rgba(0,229,255,0.05)] cursor-pointer gap-2"
          style={{ border: '1px solid var(--glass-border)' }}
          aria-label="Toggle language"
        >
          <Globe className="w-4 h-4 text-cyan" />
          <span className="font-display text-xs font-semibold text-cyan">{language.toUpperCase()}</span>
        </button>

        <button
          id="submit-report-btn"
          onClick={onSubmitReport}
          className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-lg font-display text-sm font-medium transition-all duration-300 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.12), rgba(0, 229, 255, 0.04))',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            color: 'var(--cyan)',
          }}
        >
          <FileUp className="w-4 h-4" />
          {t('action.submitReport')}
        </button>
      </div>
    </header>
  );
}
