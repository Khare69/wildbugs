import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchSpecies } from '../api/speciesApi';
import type { Species } from '../api/speciesApi';

export const SpeciesListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const navigate = useNavigate();

  // 300ms debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['species', debouncedSearch],
    queryFn: () => fetchSpecies(debouncedSearch),
  });

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'EN':
      case 'CR':
        return <span className="badge badge-red">{status} · Endangered</span>;
      case 'VU':
        return <span className="badge" style={{ backgroundColor: '#ffedd5', color: '#c2410c' }}>{status} · Vulnerable</span>;
      case 'NT':
        return <span className="badge badge-yellow">{status} · Near Threatened</span>;
      case 'LC':
      default:
        return <span className="badge badge-green">{status} · Least Concern</span>;
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
            🌿 Species Catalog
          </h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1rem' }}>
            Explore regional insect species, their micro-habitats, diets, and conservation status.
          </p>
        </div>
        <button
          onClick={() => navigate('/species/compare')}
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          ⚖️ Compare Lookalikes
        </button>
      </div>

      {/* Search Input Bar */}
      <div style={{ marginBottom: '2rem', maxWidth: '600px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem' }}>
            🔍
          </span>
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '2.75rem', fontSize: '1rem' }}
            placeholder="Search by common name, scientific name, or family..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                color: 'var(--text-light)',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && <div className="spinner" />}
      {error && (
        <div className="alert-error">
          Failed to load species catalog. Please ensure the backend is running.
        </div>
      )}

      {/* Empty State */}
      {!isLoading && data?.species.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🦗</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No species found</h3>
          <p style={{ color: 'var(--text-light)' }}>
            No insect matching "{debouncedSearch}" was found in our database.
          </p>
        </div>
      )}

      {/* Species Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
      }}>
        {data?.species.map((species: Species) => (
          <div
            key={species.id}
            className="card card-hover"
            onClick={() => navigate(`/species/${species.id}`)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              padding: 0,
            }}
          >
            {/* Thumbnail */}
            <div style={{
              height: '180px',
              backgroundColor: '#e5e7eb',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <img
                src={species.imageUrl}
                alt={species.commonName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600';
                }}
              />
              <div style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
              }}>
                {getStatusBadge(species.conservationStatus)}
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.25rem',
              }}>
                {species.family}
              </div>

              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                {species.commonName}
              </h2>

              <p style={{
                fontStyle: 'italic',
                color: 'var(--text-light)',
                fontSize: '0.875rem',
                marginBottom: '0.75rem',
              }}>
                {species.scientificName}
              </p>

              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text)',
                lineHeight: 1.45,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                marginBottom: '1rem',
                flexGrow: 1,
              }}>
                {species.description}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--primary)',
              }}>
                <span>Explore facts</span>
                <span>→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
