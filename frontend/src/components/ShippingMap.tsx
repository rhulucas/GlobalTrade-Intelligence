import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import type { ShippingRoute } from '../types';
import { AlertTriangle, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  routes: ShippingRoute[];
}

const RISK_COLORS = {
  LOW: '#34d399',
  MEDIUM: '#fbbf24',
  HIGH: '#f87171',
  CRITICAL: '#ef4444',
};

const RISK_WEIGHT = {
  LOW: 2,
  MEDIUM: 3,
  HIGH: 4,
  CRITICAL: 5,
};

const RISK_ICONS = {
  LOW: CheckCircle,
  MEDIUM: AlertCircle,
  HIGH: AlertTriangle,
  CRITICAL: XCircle,
};

function FitBounds({ routes }: { routes: ShippingRoute[] }) {
  const map = useMap();
  useEffect(() => {
    if (routes.length > 0) {
      map.setView([20, 60], 3);
    }
  }, [map, routes]);
  return null;
}

export default function ShippingMap({ routes }: Props) {
  return (
    <div className="bg-slate-800/60 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-slate-100 font-semibold">Global Shipping Route Risk</h3>
            <p className="text-slate-500 text-xs mt-0.5">Real-time chokepoint monitoring</p>
          </div>
          {/* Risk legend */}
          <div className="flex items-center gap-3 flex-wrap">
            {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((level) => (
              <div key={level} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-1.5 rounded-full"
                  style={{ backgroundColor: RISK_COLORS[level] }}
                />
                <span className="text-slate-400 text-xs">{level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="h-[380px]">
        <MapContainer
          center={[20, 60]}
          zoom={3}
          style={{ height: '100%', width: '100%', background: '#0f172a' }}
          zoomControl={true}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />
          <FitBounds routes={routes} />

          {routes.map((route) => {
            const color = RISK_COLORS[route.riskLevel];
            const weight = RISK_WEIGHT[route.riskLevel];
            const origin = route.coordinates.origin;
            const dest = route.coordinates.destination;

            return (
              <div key={route.routeId}>
                {/* Route line */}
                <Polyline
                  positions={[origin, dest]}
                  pathOptions={{
                    color,
                    weight,
                    opacity: 0.85,
                    dashArray: route.riskLevel === 'HIGH' || route.riskLevel === 'CRITICAL' ? '8 4' : undefined,
                  }}
                />

                {/* Origin marker */}
                <CircleMarker
                  center={origin}
                  radius={8}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 2 }}
                >
                  <Popup>
                    <div className="text-slate-900 min-w-[200px]">
                      <div className="font-bold text-base">{route.name}</div>
                      <div className="text-sm mt-1">
                        <span
                          className="inline-block px-1.5 py-0.5 rounded text-xs font-semibold text-white"
                          style={{ backgroundColor: color }}
                        >
                          {route.riskLevel} RISK
                        </span>
                      </div>
                      <div className="text-sm mt-1 font-medium">{route.status}</div>
                      <div className="text-xs mt-1 text-gray-600">{route.description}</div>
                      <div className="text-xs mt-1 text-gray-400">
                        {route.origin} → {route.destination}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>

                {/* Destination marker */}
                <CircleMarker
                  center={dest}
                  radius={6}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 2 }}
                />
              </div>
            );
          })}
        </MapContainer>
      </div>

      {/* Route cards */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
        {routes.map((route) => {
          const color = RISK_COLORS[route.riskLevel];
          const Icon = RISK_ICONS[route.riskLevel];
          return (
            <div
              key={route.routeId}
              className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/50 border border-slate-700/50"
            >
              <Icon size={16} style={{ color }} className="mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-slate-200 text-xs font-medium truncate">{route.name}</div>
                <div className="text-slate-500 text-xs truncate">{route.status}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
