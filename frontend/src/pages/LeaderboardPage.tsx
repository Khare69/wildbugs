import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLeaderboard } from '../api/usersApi';
import { useAuthStore } from '../store/authStore';

export const LeaderboardPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => fetchLeaderboard(),
  });

  const leaderboard = data?.leaderboard || [];
  const topThree = leaderboard.slice(0, 3);

  const getMedal = (index: number) => {
    switch (index) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return `#${index + 1}`;
    }
  };

  return (
    <div className="container" style={{ maxWidth: '900px', paddingBottom: '4rem' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.25rem' }}>🏆</div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
          Top Explorers & Contributors
        </h1>
        <p style={{ color: 'var(--text-light)', fontSize: '1rem' }}>
          Recognizing citizen naturalists documenting our regional insect biodiversity.
        </p>
      </div>

      {isLoading && <div className="spinner" />}
      {error && <div className="alert-error">Failed to load community leaderboard.</div>}

      {/* TOP 3 PODIUM */}
      {topThree.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}>
          {topThree.map((user, idx) => {
            const isMe = currentUser?.id === user.id;
            return (
              <div
                key={user.id}
                className="card card-hover"
                style={{
                  textAlign: 'center',
                  padding: '2rem 1.25rem',
                  border: isMe ? '2px solid var(--accent)' : '1px solid var(--border)',
                  backgroundColor: isMe ? 'rgba(16, 185, 129, 0.12)' : 'var(--surface)',
                  position: 'relative',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                  {getMedal(idx)}
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--primary-dark)' }}>
                  {user.name} {isMe && '(You)'}
                </h3>

                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1.25rem',
                  marginTop: '1rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>
                      {user.totalSightings}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>
                      Sightings
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {user.speciesFound}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>
                      Species
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RANKED TABLE FOR THE REST */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                Rank
              </th>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                Naturalist
              </th>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', textAlign: 'center' }}>
                Sightings
              </th>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', textAlign: 'center' }}>
                Species Found
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                  No participants on the leaderboard yet. Be the first explorer!
                </td>
              </tr>
            ) : (
              leaderboard.map((user, idx) => {
                const isMe = currentUser?.id === user.id;
                return (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      backgroundColor: isMe ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, fontSize: '0.95rem' }}>
                      {idx < 3 ? getMedal(idx) : `#${idx + 1}`}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text)' }}>{user.name}</span>
                      {isMe && (
                        <span className="badge badge-green" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>
                          You
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center', fontWeight: 700, color: 'var(--text)' }}>
                      {user.totalSightings}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                      {user.speciesFound}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
