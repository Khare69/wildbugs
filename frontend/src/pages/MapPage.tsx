import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

import { fetchSightings } from '../api/sightingsApi';
import type { Sighting } from '../api/sightingsApi';
import { fetchSpecies } from '../api/speciesApi';

// Default icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

// Helper to generate colored HTML circle markers by family
function getFamilyIcon(family?: string) {
  let color = '#2d6a4f';
  let emoji = '🪲';

  if (family === 'Nymphalidae') {
    color = '#ea580c';
    emoji = '🦋';
  } else if (family === 'Apidae') {
    color = '#d97706';
    emoji = '🐝';
  } else if (family === 'Coccinellidae' || family === 'Lucanidae') {
    color = '#dc2626';
    emoji = '🐞';
  } else if (family === 'Aeshnidae') {
    color = '#0284c7';
    emoji = '✨';
  } else if (family === 'Mantidae') {
    color = '#16a34a';
    emoji = '🦗';
  }

  return L.divIcon({
    className: 'custom-family-marker',
    html: `
      <div style="
        background-color: ${color};
        color: #ffffff;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        border: 2px solid #ffffff;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

export const MapPage: React.FC = () => {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('all');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'markers' | 'heatmap'>('markers');
  const [timeframe, setTimeframe] = useState<'all' | '30d' | '7d'>('all');

  // Fetch sightings with timeframe filter
  const { data: sightingsData, isLoading: loadingSightings } = useQuery({
    queryKey: ['sightings', timeframe],
    queryFn: () => fetchSightings({ timeframe, limit: 100 }),
  });

  // Fetch species for filter dropdown
  const { data: speciesData } = useQuery({
    queryKey: ['species'],
    queryFn: () => fetchSpecies(),
  });

  const allSightings = sightingsData?.sightings || [];

  // Filter sightings by selected species and family
  const filteredSightings = allSightings.filter((sighting: Sighting) => {
    if (selectedSpeciesId !== 'all' && sighting.speciesId?.toString() !== selectedSpeciesId) {
      return false;
    }
    if (selectedFamily !== 'all' && sighting.species?.family !== selectedFamily) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 65px)', width: '100%', overflow: 'hidden' }}>
      {/* Floating Filter & View Mode Bar */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '0.65rem 1.15rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
        maxWidth: '96%',
        color: 'var(--text)',
      }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🗺️</span>
          <strong style={{ fontSize: '0.9rem', color: 'var(--primary-dark)' }}>
            Biodiversity Map
          </strong>
        </div>

        {/* View Mode Toggle */}
        <div style={{
          display: 'flex',
          backgroundColor: '#e5e7eb',
          borderRadius: '9999px',
          padding: '2px',
          fontSize: '0.8rem',
          fontWeight: 700,
        }}>
          <button
            type="button"
            onClick={() => setViewMode('markers')}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: viewMode === 'markers' ? '#ffffff' : 'transparent',
              color: viewMode === 'markers' ? 'var(--primary-dark)' : 'var(--text-light)',
              boxShadow: viewMode === 'markers' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            📍 Markers
          </button>
          <button
            type="button"
            onClick={() => setViewMode('heatmap')}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: viewMode === 'heatmap' ? '#ea580c' : 'transparent',
              color: viewMode === 'heatmap' ? '#ffffff' : 'var(--text-light)',
              boxShadow: viewMode === 'heatmap' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            🔥 Heatmap
          </button>
        </div>

        {/* Time Horizon Filter */}
        <div style={{
          display: 'flex',
          backgroundColor: '#f3f4f6',
          borderRadius: 'var(--radius)',
          padding: '2px',
          fontSize: '0.775rem',
          fontWeight: 600,
        }}>
          {(['all', '30d', '7d'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeframe(t)}
              style={{
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius)',
                backgroundColor: timeframe === t ? 'var(--primary)' : 'transparent',
                color: timeframe === t ? '#ffffff' : 'var(--text)',
                transition: 'all 0.15s',
              }}
            >
              {t === 'all' ? 'All Time' : t === '30d' ? 'Past 30d' : 'Past 7d'}
            </button>
          ))}
        </div>

        {/* Species Filter Select */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <select
            className="input"
            style={{ padding: '0.35rem 0.55rem', fontSize: '0.825rem', width: 'auto' }}
            value={selectedSpeciesId}
            onChange={(e) => setSelectedSpeciesId(e.target.value)}
          >
            <option value="all">All Species ({allSightings.length})</option>
            {speciesData?.species.map((sp) => (
              <option key={sp.id} value={sp.id.toString()}>
                {sp.commonName}
              </option>
            ))}
          </select>
        </div>

        {/* Family Filter Select */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <select
            className="input"
            style={{ padding: '0.35rem 0.55rem', fontSize: '0.825rem', width: 'auto' }}
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
          >
            <option value="all">All Families</option>
            <option value="Nymphalidae">🦋 Nymphalidae</option>
            <option value="Apidae">🐝 Apidae</option>
            <option value="Coccinellidae">🐞 Coccinellidae</option>
            <option value="Aeshnidae">✨ Aeshnidae</option>
            <option value="Mantidae">🦗 Mantidae</option>
          </select>
        </div>

        {/* Sighting Count Chip */}
        <span style={{
          fontSize: '0.8rem',
          backgroundColor: 'var(--accent-light)',
          color: 'var(--primary-dark)',
          padding: '0.25rem 0.6rem',
          borderRadius: '9999px',
          fontWeight: 700,
        }}>
          {filteredSightings.length} sightings
        </span>

        <Link to="/upload" className="btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
          + Add
        </Link>
      </div>

      {/* Map Family Legend / Heatmap Legend */}
      <div style={{
        position: 'absolute',
        bottom: '1.5rem',
        left: '1.5rem',
        zIndex: 1000,
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
        fontSize: '0.775rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        color: 'var(--text)',
      }}>
        {viewMode === 'markers' ? (
          <>
            <strong style={{ color: 'var(--primary-dark)', marginBottom: '0.15rem' }}>Taxonomic Legend</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ea580c' }} />
              <span>🦋 Butterflies (Nymphalidae)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#d97706' }} />
              <span>🐝 Pollinators (Apidae)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
              <span>🐞 Beetles (Coleoptera)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#0284c7' }} />
              <span>✨ Dragonflies (Odonata)</span>
            </div>
          </>
        ) : (
          <>
            <strong style={{ color: '#ea580c', marginBottom: '0.15rem' }}>🔥 Density Heatmap</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
              <span>High Observation Density</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <span>Moderate Biodiversity Activity</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span>Dispersed Occurrences</span>
            </div>
          </>
        )}
      </div>

      {/* Loading Overlay */}
      {loadingSightings && (
        <div style={{
          position: 'absolute',
          top: '5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          padding: '0.75rem 1.5rem',
          borderRadius: '9999px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
          fontWeight: 600,
        }}>
          <div className="spinner" style={{ width: '18px', height: '18px', margin: 0, borderWidth: '2px' }} />
          <span>Updating biodiversity sightings...</span>
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* HEATMAP VIEW LAYER */}
        {viewMode === 'heatmap' &&
          filteredSightings.map((sighting: Sighting) => {
            if (!sighting.latitude || !sighting.longitude) return null;
            return (
              <React.Fragment key={`heat-${sighting.id}`}>
                {/* Outer radial glow */}
                <Circle
                  center={[sighting.latitude, sighting.longitude]}
                  radius={75000}
                  pathOptions={{
                    fillColor: '#ea580c',
                    fillOpacity: 0.22,
                    stroke: false,
                  }}
                />
                {/* Core intensity bubble */}
                <Circle
                  center={[sighting.latitude, sighting.longitude]}
                  radius={30000}
                  pathOptions={{
                    fillColor: '#dc2626',
                    fillOpacity: 0.55,
                    color: '#f97316',
                    weight: 1,
                  }}
                >
                  <Popup>
                    <div style={{ textAlign: 'center', padding: '0.25rem' }}>
                      <strong style={{ color: '#dc2626' }}>🔥 Hotspot Specimen</strong>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.2rem' }}>
                        {sighting.species?.commonName || 'Insect Specimen'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.15rem' }}>
                        {sighting.latitude.toFixed(2)}°N, {sighting.longitude.toFixed(2)}°E
                      </div>
                      <Link
                        to={`/sighting/${sighting.id}`}
                        style={{ display: 'inline-block', marginTop: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem' }}
                      >
                        Inspect Discovery →
                      </Link>
                    </div>
                  </Popup>
                </Circle>
              </React.Fragment>
            );
          })}

        {/* MARKERS VIEW LAYER */}
        {viewMode === 'markers' &&
          filteredSightings.map((sighting: Sighting) => {
            if (!sighting.latitude || !sighting.longitude) return null;

            const photoSrc = sighting.photoUrl.startsWith('http')
              ? sighting.photoUrl
              : `http://localhost:3001${sighting.photoUrl}`;

            const icon = getFamilyIcon(sighting.species?.family);

            return (
              <Marker key={sighting.id} position={[sighting.latitude, sighting.longitude]} icon={icon}>
                <Popup>
                  <div style={{ minWidth: '170px', maxWidth: '230px', padding: '0.2rem' }}>
                    <div style={{
                      width: '100%',
                      height: '115px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      backgroundColor: '#e5e7eb',
                      marginBottom: '0.5rem',
                    }}>
                      <img
                        src={photoSrc}
                        alt={sighting.species?.commonName || 'Specimen'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=300';
                        }}
                      />
                    </div>

                    <strong style={{ fontSize: '0.95rem', display: 'block', color: 'var(--primary-dark)', marginBottom: '0.15rem' }}>
                      {sighting.species?.commonName || 'Unidentified Sighting'}
                    </strong>

                    {sighting.species?.scientificName && (
                      <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-light)', marginBottom: '0.35rem' }}>
                        {sighting.species.scientificName}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                        {sighting.species?.family || 'Specimen'}
                      </span>
                      {sighting.status === 'community_verified' && (
                        <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '0.65rem' }}>
                          ✓ Verified
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600, marginBottom: '0.25rem' }}>
                      🤖 {sighting.aiConfidence ? `${Math.round(sighting.aiConfidence * 100)}% AI Match` : 'Reported'}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
                      Observer: {sighting.user?.name || 'Explorer'}
                    </div>

                    <a
                      href={`/sighting/${sighting.id}`}
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        background: 'var(--primary)',
                        color: '#ffffff',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      View & Verify Details →
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};
