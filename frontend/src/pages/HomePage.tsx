import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { fetchSightings } from '../api/sightingsApi';

export const HomePage: React.FC = () => {
  const { user } = useAuthStore();

  const { data: sightingsData, isLoading } = useQuery({
    queryKey: ['recentSightings'],
    queryFn: () => fetchSightings({ limit: 4 }),
  });

  const recent = sightingsData?.sightings || [];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
        color: '#ffffff',
        padding: '5rem 1.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="container" style={{ maxWidth: '850px', position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🪲</div>
          <h1 style={{ fontSize: '2.85rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
            WildBugs
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.95, maxWidth: '650px', margin: '0 auto 2.25rem auto', lineHeight: 1.6 }}>
            Discover insects. Track regional biodiversity with AI vision. Join a thriving community of citizen scientists.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <Link to="/upload" className="btn" style={{ background: 'var(--accent)', color: '#1b4332', fontWeight: 700, padding: '0.8rem 1.75rem', fontSize: '1.05rem' }}>
                📸 Upload a Sighting →
              </Link>
            ) : (
              <Link to="/register" className="btn" style={{ background: 'var(--accent)', color: '#1b4332', fontWeight: 700, padding: '0.8rem 1.75rem', fontSize: '1.05rem' }}>
                Get Started Free →
              </Link>
            )}
            <Link to="/map" className="btn btn-outline" style={{ borderColor: '#ffffff', color: '#ffffff', padding: '0.8rem 1.75rem', fontSize: '1.05rem' }}>
              🗺️ Open Live Map
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Core Features */}
      <section className="container" style={{ padding: '4rem 1rem 3rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
            How Citizen Science Powers WildBugs
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '1.05rem' }}>
            Transforming casual backyard sightings into valuable ecological data.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.75rem',
        }}>
          {/* Feature 1 */}
          <div className="card card-hover" style={{ textAlign: 'center', padding: '2.5rem 1.75rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔬</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--primary-dark)' }}>
              AI Vision Identification
            </h3>
            <p style={{ color: 'var(--text-light)', lineHeight: 1.5, fontSize: '0.95rem' }}>
              Snap or upload a photo. Our neural models analyze morphology, coloration, and wing structure to identify species with instant confidence metrics.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card card-hover" style={{ textAlign: 'center', padding: '2.5rem 1.75rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--primary-dark)' }}>
              Interactive Biodiversity Map
            </h3>
            <p style={{ color: 'var(--text-light)', lineHeight: 1.5, fontSize: '0.95rem' }}>
              Explore real-time insect occurrences across the region on an interactive geospatial canvas with filtering by species family and micro-habitat.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card card-hover" style={{ textAlign: 'center', padding: '2.5rem 1.75rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--primary-dark)' }}>
              Gamified Challenges
            </h3>
            <p style={{ color: 'var(--text-light)', lineHeight: 1.5, fontSize: '0.95rem' }}>
              Participate in seasonal bio-blitz missions, record rare pollinators, climb community leaderboards, and build your personal field journal.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Discoveries Feed */}
      <section style={{ backgroundColor: 'var(--bg)', padding: '3.5rem 1rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.35rem' }}>
                🌿 Recent Field Discoveries
              </h2>
              <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
                Latest verified insect specimens recorded by community explorers.
              </p>
            </div>
            <Link to="/map" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem' }}>
              Explore All on Map →
            </Link>
          </div>

          {isLoading && <div className="spinner" />}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}>
            {recent.map((sighting) => {
              const photoSrc = sighting.photoUrl.startsWith('http')
                ? sighting.photoUrl
                : `http://localhost:3001${sighting.photoUrl}`;

              return (
                <Link
                  key={sighting.id}
                  to={`/sighting/${sighting.id}`}
                  className="card card-hover"
                  style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ height: '180px', backgroundColor: '#e5e7eb', position: 'relative' }}>
                    <img
                      src={photoSrc}
                      alt={sighting.species?.commonName || 'Specimen'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400';
                      }}
                    />
                    {sighting.aiConfidence && (
                      <span className="badge badge-green" style={{ position: 'absolute', top: '0.65rem', right: '0.65rem' }}>
                        {Math.round(sighting.aiConfidence * 100)}% AI Match
                      </span>
                    )}
                  </div>
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.2rem', color: 'var(--text)' }}>
                      {sighting.species?.commonName || 'Specimen Discovery'}
                    </h3>
                    <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-light)', marginBottom: '0.75rem' }}>
                      {sighting.species?.scientificName}
                    </p>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-light)', borderTop: '1px solid var(--border)', paddingTop: '0.6rem' }}>
                      <span>👤 {sighting.user?.name || 'Explorer'}</span>
                      <span>📍 View →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick CTA Bottom */}
      <section className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="card" style={{
          background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)',
          color: '#ffffff',
          padding: '3.5rem 2rem',
          maxWidth: '850px',
          margin: '0 auto',
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Ready to catalog your first bug?
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '550px', margin: '0 auto 1.75rem auto' }}>
            It takes just 10 seconds to upload a photo and receive an automated biological identification.
          </p>
          <Link to="/upload" className="btn" style={{ background: '#ffffff', color: 'var(--primary-dark)', fontWeight: 700, padding: '0.8rem 1.75rem' }}>
            📸 Start Tracking Now
          </Link>
        </div>
      </section>
    </div>
  );
};
