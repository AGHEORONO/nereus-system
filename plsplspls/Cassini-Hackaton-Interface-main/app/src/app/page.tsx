'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Header from '@/components/Header';
import MapView from '@/components/MapView';
import TimeSlider from '@/components/TimeSlider';
import AlertPanel from '@/components/AlertPanel';
import ReportModal from '@/components/ReportModal';
import Toast from '@/components/Toast';
import CitySearch from '@/components/CitySearch';
import WelcomeScreen from '@/components/WelcomeScreen';
import SubscribeModal from '@/components/SubscribeModal';
import SatelliteLayerControl from '@/components/SatelliteLayerControl';
import DynamicLegend from '@/components/DynamicLegend';
import { BoundingBox, fetchCityWaterData } from '@/services/overpassService';
import { mockAlerts, getTimeRange, filterAlertsByDate, WaterAlert } from '@/data/mockData';
import { SatelliteLayerId } from '@/data/satelliteTypes';
import satelliteData from '@/data/satelliteData.json';
import { api } from '@/services/nereusApi';

export default function DashboardPage() {
  // ─── State ───
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeLayer, setActiveLayer] = useState<SatelliteLayerId>('ndwi');

  const [alerts, setAlerts] = useState<WaterAlert[]>(mockAlerts);
  const [zones, setZones] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [dynamicSatelliteData, setDynamicSatelliteData] = useState<GeoJSON.FeatureCollection>(satelliteData as GeoJSON.FeatureCollection);
  const [cityCenter, setCityCenter] = useState<{ lat: number; lng: number }>({ lat: 45.7489, lng: 21.2087 });
  const [cityBbox, setCityBbox] = useState<BoundingBox | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Fetch real data from backend
  const loadData = useCallback(async () => {
    const fetchedAlerts = await api.getAlerts();
    const fetchedReports = await api.getReports();
    const fetchedZones = await api.getZones();
    
    let combined: WaterAlert[] = [];
    if (fetchedAlerts && fetchedAlerts.length > 0) {
      combined = [...fetchedAlerts];
    } else {
      combined = [...mockAlerts];
    }

    if (fetchedReports && fetchedReports.length > 0) {
      const reportAlerts = fetchedReports.map((r: any) => ({
        id: `rep-${r.id}`,
        type: 'Other' as const,
        severity: 'low' as const,
        lat: r.lat,
        lng: r.lng,
        timestamp: r.created_at || new Date().toISOString(),
        description: r.description,
        location: r.location || 'Citizen Report',
        isReport: true, // Custom flag to identify it as a report
      }));
      combined = [...combined, ...reportAlerts];
    }

    setAlerts(combined as WaterAlert[]);
    if (fetchedZones) setZones(fetchedZones);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Apply theme class to document body
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // Time range
  const { start, end } = useMemo(() => getTimeRange(alerts), [alerts]);

  // Make sure currentDate is within bounds if alerts change
  useEffect(() => {
    setCurrentDate(end);
  }, [end]);

  // Filter alerts based on current time position
  const filteredAlerts = useMemo(
    () => filterAlertsByDate(alerts, currentDate),
    [alerts, currentDate]
  );

  // ─── Callbacks ───
  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const handleSelectAlert = useCallback((id: string) => {
    setSelectedAlertId((prev) => (prev === id ? null : id));
    // Auto-expand panel when selecting an alert
    setIsPanelCollapsed(false);
  }, []);

  const handleTogglePanel = useCallback(() => {
    setIsPanelCollapsed((prev) => !prev);
  }, []);

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSubmitReport = useCallback(() => {
    setIsModalOpen(false);
    setShowToast(true);
    loadData(); // Refresh data after report
  }, [loadData]);

  const handleDismissToast = useCallback(() => {
    setShowToast(false);
  }, []);

  const handleLayerChange = useCallback((layer: SatelliteLayerId) => {
    setActiveLayer(layer);
  }, []);

  const handleCitySelect = useCallback(
    async (cityName: string, center: { lat: number; lng: number }, bbox: BoundingBox) => {
      setCityCenter(center);
      setCityBbox(bbox);
      setSelectedAlertId(null);

      // Reload real data for the new city
      loadData();
      
      // Hide welcome screen
      setShowWelcome(false);

      // Fetch precise water data for the new bounds
      try {
        const normalizedCity = cityName.toLowerCase().trim();
        if (normalizedCity.includes('timișoara') || normalizedCity.includes('timisoara')) {
          setDynamicSatelliteData(satelliteData as GeoJSON.FeatureCollection);
        } else {
          const newData = await fetchCityWaterData(bbox);
          if (newData.features.length > 0) {
            setDynamicSatelliteData(newData);
          } else {
            console.warn(`No water features found for ${cityName}. Map will show empty overlays.`);
            setDynamicSatelliteData({ type: 'FeatureCollection', features: [] });
          }
        }
      } catch (err) {
        console.error("Failed to fetch overpass data", err);
        setDynamicSatelliteData({ type: 'FeatureCollection', features: [] });
      }
    },
    []
  );

  const handleTriggerScan = useCallback(async () => {
    if (!cityBbox) return;
    setIsScanning(true);
    try {
      await api.triggerScan(cityBbox);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  }, [cityBbox, loadData]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <div id="dashboard" className="h-screen w-screen flex flex-col overflow-hidden" style={{ background: 'var(--abyss)' }}>
      {/* Header */}
      <Header 
        onSubmitReport={handleOpenModal} 
        onTriggerScan={handleTriggerScan}
        onSubscribe={() => setIsSubscribeModalOpen(true)}
        isScanning={isScanning}
        citySearchNode={!showWelcome ? <CitySearch onCitySelect={handleCitySelect} /> : undefined}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content — vertical stack: map area + bottom alert drawer */}
      <main className="flex-1 flex flex-col pt-[52px] overflow-hidden">
        {/* Map Area (fills remaining space) */}
        <div className="flex-1 relative overflow-hidden">
          {/* Map */}
          <MapView
            key={theme}
            theme={theme}
            alerts={filteredAlerts}
            zones={zones}
            selectedAlertId={selectedAlertId}
            onSelectAlert={handleSelectAlert}
            activeLayer={activeLayer}
            satelliteData={dynamicSatelliteData}
            center={cityCenter}
            bbox={cityBbox}
          />

          {/* Satellite Layer Control (left tool rail) */}
          <SatelliteLayerControl
            activeLayer={activeLayer}
            onLayerChange={handleLayerChange}
          />

          {/* Dynamic Legend (bottom right) */}
          <DynamicLegend activeLayer={activeLayer} mapCenter={cityCenter} />

          {/* Time Slider Overlay */}
          <TimeSlider
            startDate={start}
            endDate={end}
            currentDate={currentDate}
            onDateChange={handleDateChange}
          />
        </div>

        {/* Bottom Alert Drawer */}
        <AlertPanel
          alerts={filteredAlerts}
          selectedAlertId={selectedAlertId}
          onSelectAlert={handleSelectAlert}
          isCollapsed={isPanelCollapsed}
          onToggleCollapse={handleTogglePanel}
        />
      </main>

      {/* Welcome Screen Overlay */}
      {showWelcome && <WelcomeScreen onCitySelect={handleCitySelect} />}

      {/* Modals & Toasts */}
      <ReportModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitReport}
      />
      
      <SubscribeModal 
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
      />

      {/* Toast Notification */}
      <Toast
        message="Incident report received"
        isVisible={showToast}
        onDismiss={handleDismissToast}
      />
    </div>
  );
}
