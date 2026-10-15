import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { fetchUserStats, getExportJournalUrl } from '../api/usersApi';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: () => fetchUserStats(user!.id),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <div className="alert-error">Failed to load naturalist profile data.</div>
      </div>
    );
  }

  const { user: profileUser, totalSightings, speciesFound, recentSightings, badges } = data;

  const memberSince = new Date(profileUser.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  const daysActive = Math.max(
    1,
    Math.ceil((Date.now() - new Date(profileUser.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* Profile Header */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '75px',
            height: '75px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-light)',
            color: 'var(--primary-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            fontWeight: 800,
          }}>
            {profileUser.name.charAt(0).toUpperCase()}
          </div>

          <div style={{ flexGrow: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                {profileUser.name}
              </h1>
              <span className="badge badge-green">Citizen Naturalist</span>
            </div>
            <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
              {profileUser.email} · Explorer since {memberSince}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a
              href={getExportJournalUrl(profileUser.id)}
              className="btn btn-outline"
              download="wildbugs-journal.csv"
              style={{ fontSize: '0.85rem' }}
            >
              📥 Export Journal (CSV)
            </a>
            <Link to="/upload" className="btn" style={{ fontSize: '0.85rem' }}>
              📸 Log Sighting
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem',
      }}>
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🔬</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
            {totalSightings}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600 }}>
            Total Sightings
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🦋</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
            {speciesFound}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600 }}>
            Species Discovered
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>📅</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
            {daysActive}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600 }}>
            Days Active
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🏅</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-dark)', marginTop: '0.5rem' }}>
            {badges.length} Unlocked
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600, marginTop: '0.35rem' }}>
            Badges Earned
          </div>
        </div>
      </div>

      {/* BADGES & ACHIEVEMENTS TROPHY CASE */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '1rem' }}>
          🏆 Naturalist Achievements ({badges.length})
        </h2>

        {badges.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
            Log your first wild insect sighting to unlock your first badge!
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}>
            {badges.map((b) => (
              <div
                key={b.id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  border: '1.5px solid var(--accent)',
                  backgroundColor: 'var(--surface)',
                }}
              >
                <div style={{
                  fontSize: '2.5rem',
                  backgroundColor: 'var(--accent-light)',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {b.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.2rem' }}>
                    {b.name}
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-light)', lineHeight: 1.35 }}>
                    {b.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sighting History */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
            🌿 My Field Journal & Sightings
          </h2>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
            {recentSightings.length} records shown
          </span>
        </div>

        {recentSightings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📸</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              No sightings recorded yet
            </h3>
            <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
              Step outside, find an insect, and upload your first photo to begin your discovery journal!
            </p>
            <Link to="/upload" className="btn">
              Capture Your First Sighting →
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}>
            {recentSightings.map((sighting) => {
              const photoSrc = sighting.photoUrl.startsWith('http')
                ? sighting.photoUrl
                : `http://localhost:3001${sighting.photoUrl}`;

              const sightingDate = new Date(sighting.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <Link
                  key={sighting.id}
                  to={`/sighting/${sighting.id}`}
                  className="card card-hover"
                  style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ height: '170px', backgroundColor: '#e5e7eb', position: 'relative' }}>
                    <img
                      src={photoSrc}
                      alt={sighting.species?.commonName || 'Specimen'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400';
                      }}
                    />
                    <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.35rem' }}>
                      {sighting.status === 'community_verified' && (
                        <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                          ✓ Verified
                        </span>
                      )}
                      {sighting.aiConfidence && (
                        <span className="badge" style={{ backgroundColor: '#ffffff', color: 'var(--primary-dark)', fontSize: '0.65rem' }}>
                          {Math.round(sighting.aiConfidence * 100)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                      {sighting.species?.family || 'Specimen'}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                      {sighting.species?.commonName || 'Unidentified Sighting'}
                    </h3>
                    <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.75rem' }}>
                      {sighting.species?.scientificName}
                    </p>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-light)', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                      <span>📅 {sightingDate}</span>
                      <span>Details →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
