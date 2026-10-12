/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Source: Google Maps Platform Code Assist
import React, { useState, useEffect } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow, 
  useMap 
} from '@vis.gl/react-google-maps';
import { 
  Server, 
  Wifi, 
  CheckCircle2, 
  ShieldCheck, 
  Globe2, 
  Activity, 
  Zap, 
  Maximize2, 
  Minimize2, 
  X, 
  Layers,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { Language, Translations } from '../translations';

export interface CdnServerNode {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  region: 'middleEast' | 'europe' | 'northAmerica' | 'asiaPacific' | 'southAmerica' | 'oceania';
  lat: number;
  lng: number;
  pingMs: number;
  bandwidth: string;
  loadPercent: number;
  status: 'optimal' | 'busy' | 'active';
  isDefault?: boolean;
}

export const CDN_SERVERS: CdnServerNode[] = [
  {
    id: 'dxb-1',
    name: 'Dubai Cloud Node (ME-1)',
    city: 'Dubai',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    region: 'middleEast',
    lat: 25.2048,
    lng: 55.2708,
    pingMs: 14,
    bandwidth: '20 Gbps',
    loadPercent: 24,
    status: 'optimal',
    isDefault: true,
  },
  {
    id: 'fra-1',
    name: 'Frankfurt Central (EU-1)',
    city: 'Frankfurt',
    country: 'Germany',
    flag: '🇩🇪',
    region: 'europe',
    lat: 50.1109,
    lng: 8.6821,
    pingMs: 22,
    bandwidth: '40 Gbps',
    loadPercent: 35,
    status: 'optimal',
  },
  {
    id: 'lon-1',
    name: 'London Gateway (EU-2)',
    city: 'London',
    country: 'United Kingdom',
    flag: '🇬🇧',
    region: 'europe',
    lat: 51.5074,
    lng: -0.1278,
    pingMs: 28,
    bandwidth: '30 Gbps',
    loadPercent: 42,
    status: 'optimal',
  },
  {
    id: 'iad-1',
    name: 'Virginia High-Speed (US-East)',
    city: 'Ashburn, VA',
    country: 'United States',
    flag: '🇺🇸',
    region: 'northAmerica',
    lat: 38.8951,
    lng: -77.0364,
    pingMs: 65,
    bandwidth: '50 Gbps',
    loadPercent: 48,
    status: 'optimal',
  },
  {
    id: 'nrt-1',
    name: 'Tokyo Express (AP-East)',
    city: 'Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    region: 'asiaPacific',
    lat: 35.6762,
    lng: 139.6503,
    pingMs: 88,
    bandwidth: '25 Gbps',
    loadPercent: 31,
    status: 'optimal',
  },
  {
    id: 'sin-1',
    name: 'Singapore Equinix (AP-South)',
    city: 'Singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    region: 'asiaPacific',
    lat: 1.3521,
    lng: 103.8198,
    pingMs: 72,
    bandwidth: '25 Gbps',
    loadPercent: 29,
    status: 'optimal',
  },
  {
    id: 'gru-1',
    name: 'São Paulo Hub (SA-1)',
    city: 'São Paulo',
    country: 'Brazil',
    flag: '🇧🇷',
    region: 'southAmerica',
    lat: -23.5505,
    lng: -46.6333,
    pingMs: 135,
    bandwidth: '15 Gbps',
    loadPercent: 55,
    status: 'busy',
  },
  {
    id: 'syd-1',
    name: 'Sydney Oceanic (OC-1)',
    city: 'Sydney',
    country: 'Australia',
    flag: '🇦🇺',
    region: 'oceania',
    lat: -33.8688,
    lng: 151.2093,
    pingMs: 142,
    bandwidth: '15 Gbps',
    loadPercent: 38,
    status: 'optimal',
  },
];

// Inner helper component to pan/zoom map programmatically
function MapPanController({
  targetCenter,
  targetZoom,
}: {
  targetCenter: { lat: number; lng: number } | null;
  targetZoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !targetCenter) return;
    map.panTo(targetCenter);
    map.setZoom(targetZoom);
  }, [map, targetCenter, targetZoom]);

  return null;
}

interface GlobalCdnMapProps {
  lang: Language;
  t: Translations;
  activeServerId: string;
  onSelectServer: (server: CdnServerNode) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export const GlobalCdnMap: React.FC<GlobalCdnMapProps> = ({
  lang,
  t,
  activeServerId,
  onSelectServer,
  isExpanded = false,
  onToggleExpand,
  onClose,
  showCloseButton = false,
}) => {
  const isRtl = lang === 'ar';
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAaJ803NekgrwuPDtLcGYe8b560t8EKOt8';
  
  const [selectedServer, setSelectedServer] = useState<CdnServerNode | null>(() => {
    return CDN_SERVERS.find((s) => s.id === activeServerId) || CDN_SERVERS[0];
  });
  const [activeRegion, setActiveRegion] = useState<string>('all');
  const [targetView, setTargetView] = useState<{ center: { lat: number; lng: number }; zoom: number }>({
    center: { lat: 25.0, lng: 15.0 },
    zoom: 2,
  });
  const [isPinging, setIsPinging] = useState(false);
  const [pingDelays, setPingDelays] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    CDN_SERVERS.forEach((s) => {
      map[s.id] = s.pingMs;
    });
    return map;
  });

  const handleRegionClick = (regionKey: string) => {
    setActiveRegion(regionKey);
    switch (regionKey) {
      case 'middleEast':
        setTargetView({ center: { lat: 25.2048, lng: 55.2708 }, zoom: 5 });
        break;
      case 'europe':
        setTargetView({ center: { lat: 50.5, lng: 4.5 }, zoom: 4.5 });
        break;
      case 'northAmerica':
        setTargetView({ center: { lat: 39.5, lng: -98.35 }, zoom: 4 });
        break;
      case 'asiaPacific':
        setTargetView({ center: { lat: 22.0, lng: 125.0 }, zoom: 3.8 });
        break;
      case 'all':
      default:
        setTargetView({ center: { lat: 25.0, lng: 15.0 }, zoom: 2 });
        break;
    }
  };

  const handlePingTest = () => {
    setIsPinging(true);
    setTimeout(() => {
      setPingDelays((prev) => {
        const next: Record<string, number> = {};
        CDN_SERVERS.forEach((s) => {
          // slight random jitter around real baseline
          const variance = Math.floor((Math.random() - 0.5) * 6);
          next[s.id] = Math.max(8, prev[s.id] + variance);
        });
        return next;
      });
      setIsPinging(false);
    }, 900);
  };

  const activeServer = CDN_SERVERS.find((s) => s.id === activeServerId) || CDN_SERVERS[0];

  return (
    <div 
      className={`bg-[#0f1219] border border-gray-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl transition-all duration-300 ${
        isExpanded ? 'h-[750px] w-full' : 'h-[520px] w-full'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Header Bar */}
      <div className="p-4 bg-gray-900/90 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {t.map.title}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-indigo-400" />
                <span>{t.map.badge}</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block mt-0.5">
              {t.map.subtitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Ping Test Button */}
          <button
            type="button"
            onClick={handlePingTest}
            disabled={isPinging}
            className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-gray-700/60 cursor-pointer disabled:opacity-50"
            title={t.map.pingTest}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? t.map.testingPing : t.map.pingTest}</span>
          </button>

          {/* Expand/Collapse Toggle */}
          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
              title={isExpanded ? t.map.collapse : t.map.expand}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          {/* Optional Close Button */}
          {showCloseButton && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
              title={t.map.closeMap}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Region Fast Selector Pills */}
      <div className="px-4 py-2 bg-gray-950/60 border-b border-gray-800/80 flex items-center gap-2 overflow-x-auto text-xs shrink-0 no-scrollbar">
        <span className="text-gray-500 text-[11px] font-semibold flex items-center gap-1 shrink-0">
          <Layers className="w-3.5 h-3.5 text-gray-400" />
          <span>{isRtl ? 'المناطق:' : 'Regions:'}</span>
        </span>
        {[
          { key: 'all', label: t.map.regions.all },
          { key: 'middleEast', label: t.map.regions.middleEast },
          { key: 'europe', label: t.map.regions.europe },
          { key: 'northAmerica', label: t.map.regions.northAmerica },
          { key: 'asiaPacific', label: t.map.regions.asiaPacific },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => handleRegionClick(item.key)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeRegion === item.key
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-gray-900/80 text-gray-400 hover:text-gray-200 border border-gray-800 hover:border-gray-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Google Map Viewport */}
      <div className="flex-1 relative w-full overflow-hidden min-h-[300px]">
        <APIProvider apiKey={apiKey} libraries={['marker']}>
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={targetView.center}
            defaultZoom={targetView.zoom}
            gestureHandling="greedy"
            disableDefaultUI={false}
            // CRITICAL: Mandatory internal tracking prop required by Google Maps skill
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            <MapPanController 
              targetCenter={targetView.center} 
              targetZoom={targetView.zoom} 
            />

            {/* Render CDN Server Advanced Markers */}
            {CDN_SERVERS.map((server) => {
              const isSelected = selectedServer?.id === server.id;
              const isCurrentActive = activeServerId === server.id;
              const currentPing = pingDelays[server.id] || server.pingMs;

              return (
                <AdvancedMarker
                  key={server.id}
                  position={{ lat: server.lat, lng: server.lng }}
                  title={`${server.name} (${server.city})`}
                  onClick={() => {
                    setSelectedServer(server);
                    setTargetView({ center: { lat: server.lat, lng: server.lng }, zoom: 5 });
                  }}
                >
                  <Pin
                    background={isCurrentActive ? '#10b981' : isSelected ? '#6366f1' : '#3b82f6'}
                    borderColor={isCurrentActive ? '#047857' : isSelected ? '#4338ca' : '#1d4ed8'}
                    glyphColor="#ffffff"
                    scale={isCurrentActive ? 1.35 : isSelected ? 1.25 : 1.05}
                  >
                    <span className="text-xs">{server.flag}</span>
                  </Pin>
                </AdvancedMarker>
              );
            })}

            {/* Interactive InfoWindow for clicked server */}
            {selectedServer && (
              <InfoWindow
                position={{ lat: selectedServer.lat, lng: selectedServer.lng }}
                onCloseClick={() => setSelectedServer(null)}
                maxWidth={320}
              >
                <div className="p-2 text-gray-900 flex flex-col gap-2" dir={isRtl ? 'rtl' : 'ltr'}>
                  <div className="flex items-center justify-between border-b pb-1.5 gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{selectedServer.flag}</span>
                      <h4 className="font-bold text-xs text-gray-900 leading-tight">
                        {selectedServer.name}
                      </h4>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {selectedServer.city}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <div>
                      <span className="text-gray-500 block text-[10px]">{t.map.ping}</span>
                      <span className="font-mono font-bold text-indigo-700 flex items-center gap-1">
                        <Wifi className="w-3 h-3 text-emerald-600" />
                        {pingDelays[selectedServer.id] || selectedServer.pingMs} ms
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 block text-[10px]">{t.map.bandwidth}</span>
                      <span className="font-mono font-bold text-gray-800">
                        {selectedServer.bandwidth}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 block text-[10px]">{t.map.activeLoad}</span>
                      <span className="font-mono font-bold text-gray-800">
                        {selectedServer.loadPercent}%
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 block text-[10px]">{isRtl ? 'الحالة' : 'Status'}</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {t.map.statusOnline.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  {activeServerId === selectedServer.id ? (
                    <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.map.selectedServer}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectServer(selectedServer);
                      }}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>{t.map.selectServer}</span>
                    </button>
                  )}
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Floating Active Node Status Badge over map bottom */}
        <div className={`absolute bottom-3 ${isRtl ? 'right-3' : 'left-3'} z-10 bg-gray-900/90 backdrop-blur-md border border-gray-700/80 rounded-xl p-2.5 px-3.5 shadow-xl flex items-center gap-3 text-xs text-white max-w-[90%]`}>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Server className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {t.map.connected}:
              </span>
              <span className="font-bold text-emerald-300 truncate">
                {activeServer.flag} {activeServer.name}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono mt-0.5">
              <span>Ping: <strong className="text-emerald-400">{pingDelays[activeServer.id] || activeServer.pingMs}ms</strong></span>
              <span>Load: <strong className="text-indigo-300">{activeServer.loadPercent}%</strong></span>
              <span className="text-gray-500 hidden sm:inline">| {activeServer.bandwidth}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info & Attribution */}
      <div className="p-2.5 px-4 bg-gray-950/80 border-t border-gray-800 text-[11px] text-gray-500 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>{t.map.googleMapsAttribution}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-mono text-[10px]">
            ● {CDN_SERVERS.length} Global Nodes Active
          </span>
        </div>
      </div>
    </div>
  );
};
