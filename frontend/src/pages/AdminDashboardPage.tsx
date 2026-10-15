import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminMetrics,
  fetchPendingVerifications,
  expertVerifySighting,
  deleteSighting,
  promoteMe,
} from '../api/adminApi';
import { useAuthStore } from '../store/authStore';

export const AdminDashboardPage: React.FC = () => {
  const { user, login } = useAuthStore();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'community_verified' | 'expert_verified'>('all');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isPrivileged = user?.role === 'admin' || user?.role === 'expert';

  // Metrics Query
  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: fetchAdminMetrics,
    enabled: isPrivileged,
  });

  // Pending Verifications Queue Query
  const { data: queueData, isLoading: queueLoading } = useQuery({
    queryKey: ['admin-queue', statusFilter],
    queryFn: () => fetchPendingVerifications(statusFilter),
    enabled: isPrivileged,
  });

  // Role Promotion Mutation (For frictionless hackathon evaluation)
  const promoteMutation = useMutation({
    mutationFn: (targetRole: 'expert' | 'admin') => promoteMe(targetRole),
    onSuccess: (res) => {
      login(res.user, res.token);
      setActionSuccess(`Account elevated to ${res.user.role.toUpperCase()}! You now possess expert certification authority.`);
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-queue'] });
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.error || 'Failed to update role.');
    },
  });

  // Expert Certify Mutation
  const verifyMutation = useMutation({
    mutationFn: (sightingId: string) => expertVerifySighting(sightingId),
    onSuccess: () => {
      setActionSuccess('Specimen successfully certified with Expert Naturalist stamp!');
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-queue'] });
      queryClient.invalidateQueries({ queryKey: ['sightings'] });
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.error || 'Failed to certify observation.');
    },
  });

  // Delete / Moderate Sighting Mutation
  const deleteMutation = useMutation({
    mutationFn: (sightingId: string) => deleteSighting(sightingId),
    onSuccess: () => {
      setActionSuccess('Spurious observation purged from citizen-science registry.');
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-queue'] });
      queryClient.invalidateQueries({ queryKey: ['sightings'] });
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.error || 'Failed to delete observation.');
    },
  });

  const metrics = metricsData?.metrics;
  const sightings = queueData?.sightings || [];

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', maxWidth: '600px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.75rem' }}>
            Expert Naturalist & Governance Portal
          </h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Access to data validation, taxon review queues, and platform analytics requires an authenticated account.
          </p>
          <Link to="/login" className="btn" style={{ padding: '0.75rem 1.75rem' }}>
            Log In with Demo Account →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '5rem', maxWidth: '1200px' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#ecfdf5',
            color: 'var(--primary-dark)',
            fontSize: '0.85rem',
            fontWeight: 700,
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            marginBottom: '0.5rem',
          }}>
            🛡️ Biodiversity Governance & Scientific Review
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>
            Expert Entomologist Dashboard
          </h1>
        </div>

        {/* User Role Badge & Fast Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: '#ffffff',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Current Role:</div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-dark)', textTransform: 'uppercase' }}>
              {user.role === 'admin' ? '🛡️ Administrator' : user.role === 'expert' ? '🌿 Expert Naturalist' : '👤 Citizen User'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {user.role !== 'expert' && (
              <button
                onClick={() => promoteMutation.mutate('expert')}
                disabled={promoteMutation.isPending}
                className="btn btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                title="Switch role to Expert Entomologist"
              >
                Become Expert
              </button>
            )}
            {user.role !== 'admin' && (
              <button
                onClick={() => promoteMutation.mutate('admin')}
                disabled={promoteMutation.isPending}
                className="btn btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                title="Switch role to Platform Admin"
              >
                Become Admin
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Notification Banners */}
      {actionSuccess && (
        <div style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: 'var(--radius)',
          color: '#166534',
          fontWeight: 600,
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>✓ {actionSuccess}</span>
          <button
            onClick={() => setActionSuccess(null)}
            style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {actionError && (
        <div style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: 'var(--radius)',
          color: '#991b1b',
          fontWeight: 600,
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>⚠️ {actionError}</span>
          <button
            onClick={() => setActionError(null)}
            style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* If standard user, show invitation to elevate */}
      {!isPrivileged && (
        <div className="card" style={{
          backgroundColor: '#fffbeb',
          border: '1.5px solid #fcd34d',
          padding: '2rem',
          marginBottom: '2rem',
          textAlign: 'center',
        }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#92400e', marginBottom: '0.5rem' }}>
            Elevate to Scientific Reviewer Mode
          </h3>
          <p style={{ color: '#78350f', maxWidth: '650px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
            To inspect the moderation queue, verify species identifications, and view platform metrics, switch your active demo account to an <strong>Expert Naturalist</strong> or <strong>Administrator</strong>.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => promoteMutation.mutate('expert')}
              disabled={promoteMutation.isPending}
              className="btn"
              style={{ backgroundColor: '#15803d', padding: '0.75rem 1.5rem' }}
            >
              🌿 Switch to Expert Naturalist
            </button>
            <button
              onClick={() => promoteMutation.mutate('admin')}
              disabled={promoteMutation.isPending}
              className="btn"
              style={{ backgroundColor: '#1e293b', padding: '0.75rem 1.5rem' }}
            >
              🛡️ Switch to Platform Administrator
            </button>
          </div>
        </div>
      )}

      {isPrivileged && (
        <>
          {/* Key Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                Total Sightings
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-dark)', marginTop: '0.25rem' }}>
                {metricsLoading ? '...' : metrics?.totalSightings || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '0.2rem' }}>
                {metrics?.verifiedRate || 0}% overall verification rate
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #eab308' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ca8a04', textTransform: 'uppercase' }}>
                Pending Review
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ca8a04', marginTop: '0.25rem' }}>
                {metricsLoading ? '...' : metrics?.pendingCount || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
                Awaiting community consensus
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #16a34a' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                Community Verified
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a', marginTop: '0.25rem' }}>
                {metricsLoading ? '...' : metrics?.communityVerifiedCount || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
                Peer-reviewed by naturalists
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #7c3aed' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>
                Expert Certified
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.25rem' }}>
                {metricsLoading ? '...' : metrics?.expertVerifiedCount || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
                Gold standard research quality
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                Community Members
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', marginTop: '0.25rem' }}>
                {metricsLoading ? '...' : metrics?.totalUsers || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
                {metrics?.totalSpecies || 0} biological taxa tracked
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                Total Interactions
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', marginTop: '0.25rem' }}>
                {metricsLoading
                  ? '...'
                  : (metrics?.totalVerifications || 0) + (metrics?.totalComments || 0) + (metrics?.totalLikes || 0)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
                Verifications, comments & likes
              </div>
            </div>
          </div>

          {/* Pending Verifications Queue Header & Filters */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>
                  Taxonomic Review & Moderation Queue
                </h3>
                <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
                  Certify citizen observations to elevate research-grade classification or remove erroneous records.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {(['all', 'pending', 'community_verified', 'expert_verified'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setStatusFilter(filterKey)}
                    className={statusFilter === filterKey ? 'btn' : 'btn btn-outline'}
                    style={{
                      fontSize: '0.8rem',
                      padding: '0.4rem 0.8rem',
                      textTransform: 'capitalize',
                    }}
                  >
                    {filterKey.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Verification Queue Table / List */}
            {queueLoading ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <div className="spinner" />
                <p style={{ marginTop: '0.75rem', color: 'var(--text-light)' }}>Loading verification queue...</p>
              </div>
            ) : sightings.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                backgroundColor: '#f8fafc',
                borderRadius: 'var(--radius)',
                border: '1px dashed var(--border)',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
                  All Observations Reviewed!
                </h4>
                <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', margin: 0 }}>
                  No sightings in this category require expert intervention at this time.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sightings.map((sighting) => {
                  const displayPhoto = sighting.photoUrl.startsWith('http')
                    ? sighting.photoUrl
                    : `http://localhost:3001${sighting.photoUrl}`;

                  const formattedDate = new Date(sighting.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={sighting.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        backgroundColor: '#ffffff',
                        gap: '1.25rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      {/* Left: Thumbnail & Species Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 350px' }}>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          backgroundColor: '#e2e8f0',
                          flexShrink: 0,
                        }}>
                          <img
                            src={displayPhoto}
                            alt="Specimen"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=200';
                            }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-dark)' }}>
                              {sighting.species?.commonName || 'Unidentified Sighting'}
                            </span>
                            <span className={`badge ${
                              sighting.status === 'expert_verified'
                                ? 'badge-green'
                                : sighting.status === 'community_verified'
                                ? 'badge-green'
                                : 'badge-yellow'
                            }`} style={{ fontSize: '0.7rem' }}>
                              {sighting.status.replace('_', ' ')}
                            </span>
                          </div>

                          <div style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.25rem' }}>
                            {sighting.species?.scientificName || 'Taxon pending confirmation'}
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                            Observed by <strong>{sighting.user?.name || 'Naturalist'}</strong> · {formattedDate}
                          </div>
                        </div>
                      </div>

                      {/* Middle: AI & Community Consensus */}
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {sighting.aiConfidence && (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>
                              AI Match
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>
                              {Math.round(sighting.aiConfidence * 100)}%
                            </div>
                          </div>
                        )}

                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>
                            Peer Votes
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>
                            👍 {sighting._count?.verifications || 0}
                          </div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>
                            Comments
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>
                            💬 {sighting._count?.comments || 0}
                          </div>
                        </div>
                      </div>

                      {/* Right: Expert Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <Link
                          to={`/sighting/${sighting.id}`}
                          className="btn btn-outline"
                          style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                        >
                          👁️ Inspect
                        </Link>

                        {sighting.status !== 'expert_verified' && (
                          <button
                            onClick={() => verifyMutation.mutate(sighting.id)}
                            disabled={verifyMutation.isPending}
                            className="btn"
                            style={{
                              fontSize: '0.8rem',
                              padding: '0.4rem 0.85rem',
                              backgroundColor: '#15803d',
                            }}
                          >
                            ✓ Certify
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this observation? This action cannot be undone.')) {
                              deleteMutation.mutate(sighting.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="btn btn-outline"
                          style={{
                            fontSize: '0.8rem',
                            padding: '0.4rem 0.75rem',
                            color: 'var(--danger)',
                            borderColor: 'var(--danger)',
                          }}
                        >
                          🗑️ Purge
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
