import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchChallenges, joinChallenge } from '../api/challengesApi';
import type { Challenge } from '../api/challengesApi';
import { useAuthStore } from '../store/authStore';

export const ChallengesPage: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [joiningId, setJoiningId] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => fetchChallenges(),
  });

  const joinMutation = useMutation({
    mutationFn: (id: number) => joinChallenge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      setJoiningId(null);
    },
    onError: () => {
      setJoiningId(null);
    },
  });

  const handleJoin = (id: number) => {
    setJoiningId(id);
    joinMutation.mutate(id);
  };

  const challenges = data?.challenges || [];

  return (
    <div className="container" style={{ maxWidth: '850px', paddingBottom: '4rem' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.25rem' }}>🎯</div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
          Seasonal Citizen-Science Missions
        </h1>
        <p style={{ color: 'var(--text-light)', fontSize: '1rem' }}>
          Team up with local naturalists to track target insect families and earn conservation milestones.
        </p>
      </div>

      {isLoading && <div className="spinner" />}
      {error && <div className="alert-error">Failed to load seasonal challenges.</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {challenges.map((challenge: Challenge) => {
          const isJoined = challenge.userProgress !== null;
          const currentProgress = challenge.userProgress?.progress || 0;
          const percentage = Math.min(100, Math.round((currentProgress / challenge.targetCount) * 100));
          const isCompleted = challenge.userProgress?.completed || percentage >= 100;

          return (
            <div
              key={challenge.id}
              className="card card-hover"
              style={{
                padding: '2rem',
                border: isCompleted ? '2px solid var(--accent)' : '1px solid var(--border)',
                position: 'relative',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="badge badge-green">
                      {challenge.speciesFamily ? `${challenge.speciesFamily} Family` : 'Open Bio-Blitz'}
                    </span>
                    <span className="badge badge-yellow">
                      ⏰ {challenge.daysRemaining} days remaining
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                    {challenge.title}
                  </h2>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  👥 {challenge.totalParticipants} participants
                </div>
              </div>

              {/* Description */}
              <p style={{ color: 'var(--text)', lineHeight: 1.5, marginBottom: '1.5rem', fontSize: '0.975rem' }}>
                {challenge.description}
              </p>

              {/* Progress or Join CTA */}
              {isJoined ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--primary-dark)' }}>
                      Mission Progress: {currentProgress} / {challenge.targetCount} documented
                    </span>
                    <span style={{ color: isCompleted ? '#166534' : 'var(--text)' }}>
                      {isCompleted ? '✓ Completed!' : `${percentage}%`}
                    </span>
                  </div>

                  {/* Animated Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '12px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                    marginBottom: '1rem',
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: isCompleted ? '#166534' : 'var(--accent)',
                      borderRadius: '9999px',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      Log sightings matching {challenge.speciesFamily || 'the criteria'} to advance.
                    </span>
                    <Link to="/upload" className="btn" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
                      📸 Log Sighting for Mission
                    </Link>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                    Target: Document {challenge.targetCount} specimens to complete this mission.
                  </span>

                  {user ? (
                    <button
                      onClick={() => handleJoin(challenge.id)}
                      disabled={joiningId === challenge.id}
                      className="btn"
                      style={{ padding: '0.65rem 1.25rem' }}
                    >
                      {joiningId === challenge.id ? 'Joining...' : '🎯 Join Challenge'}
                    </button>
                  ) : (
                    <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                      Log in to Participate
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
