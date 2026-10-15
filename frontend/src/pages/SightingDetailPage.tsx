import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSightingById, addComment, toggleVerify, toggleLike } from '../api/sightingsApi';
import { useAuthStore } from '../store/authStore';

export const SightingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['sighting', id],
    queryFn: () => fetchSightingById(id!),
    enabled: !!id,
  });

  const sighting = data?.sighting;
  const verificationCount = data?.verificationCount || 0;
  const hasVerified = data?.hasVerified || false;
  const likeCount = data?.likeCount || 0;
  const hasLiked = data?.hasLiked || false;

  // Verification Mutation
  const verifyMutation = useMutation({
    mutationFn: () => toggleVerify(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sighting', id] });
    },
  });

  // Like Mutation
  const likeMutation = useMutation({
    mutationFn: () => toggleLike(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sighting', id] });
    },
  });

  // Comment Submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    setCommentError(null);

    try {
      await addComment(id!, commentText.trim());
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['sighting', id] });
    } catch (err: any) {
      setCommentError(err.response?.data?.error || 'Failed to post comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error || !sighting) {
    return (
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '3rem 2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--danger)' }}>Sighting Not Found</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
            We could not locate this sighting in the biodiversity registry.
          </p>
          <Link to="/map" className="btn">
            ← Explore Live Map
          </Link>
        </div>
      </div>
    );
  }

  const displayPhotoUrl = sighting.photoUrl.startsWith('http')
    ? sighting.photoUrl
    : `http://localhost:3001${sighting.photoUrl}`;

  const formattedDate = new Date(sighting.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isVerified = sighting.status === 'community_verified';

  return (
    <div className="container" style={{ maxWidth: '900px', paddingBottom: '4rem' }}>
      {/* Back link */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            color: 'var(--primary)',
            fontWeight: 600,
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: 0,
          }}
        >
          ← Back
        </button>
      </div>

      {/* Main Specimen Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
        {/* Full Image Banner */}
        <div style={{ height: '380px', backgroundColor: '#e5e7eb', position: 'relative' }}>
          <img
            src={displayPhotoUrl}
            alt={sighting.species?.commonName || 'Insect specimen'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800';
            }}
          />
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className={`badge ${isVerified ? 'badge-green' : 'badge-yellow'}`}>
              {isVerified ? '✓ Community Verified' : '⏳ Review Pending'}
            </span>
            {sighting.aiConfidence && (
              <span className="badge" style={{ backgroundColor: '#ffffff', color: 'var(--primary-dark)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                🤖 {Math.round(sighting.aiConfidence * 100)}% AI Match
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                {sighting.species?.family || 'Regional Invertebrate'}
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>
                {sighting.species?.commonName || 'Unidentified Sighting'}
              </h1>
              {sighting.species?.scientificName && (
                <p style={{ fontStyle: 'italic', color: 'var(--text-light)', fontSize: '1.15rem' }}>
                  {sighting.species.scientificName}
                </p>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '0.25rem' }}>
                Observer
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)' }}>
                👤 {sighting.user?.name || 'Anonymous Naturalist'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                {formattedDate}
              </div>
            </div>
          </div>

          {/* Peer Verification & Social Reactions Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            backgroundColor: isVerified ? '#f0fdf4' : '#fefce8',
            border: `1px solid ${isVerified ? '#bbf7d0' : '#fef08a'}`,
            borderRadius: 'var(--radius)',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isVerified ? '#166534' : '#854d0e' }}>
                  {isVerified ? '✓ Verified Identification' : '🤝 Community Peer-Review'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  {verificationCount} naturalist{verificationCount === 1 ? '' : 's'} verified this identification
                </div>
              </div>

              {/* Heart Reaction Pill */}
              <button
                onClick={() => user ? likeMutation.mutate() : navigate('/login')}
                disabled={likeMutation.isPending}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  border: hasLiked ? '1px solid #f43f5e' : '1px solid #cbd5e1',
                  backgroundColor: hasLiked ? '#fff1f2' : '#ffffff',
                  color: hasLiked ? '#e11d48' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
                title={user ? (hasLiked ? 'Unlike this observation' : 'Heart this observation') : 'Log in to heart this observation'}
              >
                <span style={{ fontSize: '1.1rem', transform: hasLiked ? 'scale(1.15)' : 'none', transition: 'transform 0.15s' }}>
                  {hasLiked ? '❤️' : '🤍'}
                </span>
                <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {sighting.species && (
                <Link
                  to={`/species/compare?a=${sighting.species.id}`}
                  className="btn btn-outline"
                  style={{
                    fontSize: '0.85rem',
                    padding: '0.45rem 0.85rem',
                    borderColor: 'var(--primary)',
                    color: 'var(--primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  🔍 Compare Lookalikes
                </Link>
              )}

              {user ? (
                <button
                  onClick={() => verifyMutation.mutate()}
                  disabled={verifyMutation.isPending}
                  className={hasVerified ? 'btn' : 'btn btn-outline'}
                  style={{
                    fontSize: '0.875rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: hasVerified ? '#166534' : 'transparent',
                  }}
                >
                  {hasVerified ? '✓ You Agreed' : '👍 Agree with ID'}
                </button>
              ) : (
                <Link to="/login" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                  Log in to verify →
                </Link>
              )}
            </div>
          </div>

          {/* Sighting Metadata Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            padding: '1.25rem',
            backgroundColor: 'var(--bg)',
            borderRadius: 'var(--radius)',
            marginBottom: '1.5rem',
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block' }}>GPS Coordinates</span>
              <strong style={{ fontSize: '0.95rem' }}>{sighting.latitude.toFixed(4)}° N, {sighting.longitude.toFixed(4)}° E</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block' }}>Identification Method</span>
              <strong style={{ fontSize: '0.95rem' }}>AI Vision + Peer Review</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block' }}>Verification Status</span>
              <strong style={{ fontSize: '0.95rem', color: isVerified ? '#166534' : '#ca8a04' }}>
                {isVerified ? 'Community Confirmed' : 'Awaiting Peer Votes'}
              </strong>
            </div>
          </div>

          {/* Field Notes */}
          {sighting.notes && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--primary-dark)' }}>
                📝 Field Observer Notes
              </h3>
              <p style={{ color: 'var(--text)', lineHeight: 1.5, background: '#fff', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                "{sighting.notes}"
              </p>
            </div>
          )}

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/map" className="btn">
              🗺️ Locate on Biodiversity Map
            </Link>
            {sighting.species && (
              <Link to={`/species/${sighting.species.id}`} className="btn btn-outline">
                🌿 View Full Species Guide
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* COMMUNITY DISCUSSION SECTION */}
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
          💬 Community Discussion ({sighting.comments?.length || 0})
        </h2>
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Share ecological observations, correct identification, or discuss local habitat conditions.
        </p>

        {commentError && <div className="alert-error">{commentError}</div>}

        {/* Comment Form */}
        {user ? (
          <form onSubmit={handleCommentSubmit} style={{ marginBottom: '2rem' }}>
            <div className="form-group">
              <textarea
                className="input"
                rows={3}
                placeholder="Add your note, field tip, or alternative species hypothesis..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmittingComment || !commentText.trim()}
              className="btn"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
            >
              {isSubmittingComment ? 'Posting...' : 'Post Note'}
            </button>
          </form>
        ) : (
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius)', marginBottom: '1.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
              Want to join the discussion?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Log in to post a comment
              </Link>
            </span>
          </div>
        )}

        {/* Comment List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sighting.comments && sighting.comments.length > 0 ? (
            sighting.comments.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: 'var(--bg)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--primary-dark)' }}>
                    👤 {c.user?.name || 'Explorer'}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                    {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: '0.925rem', color: 'var(--text)', lineHeight: 1.45 }}>
                  {c.content}
                </p>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
              No comments yet. Be the first to share your field observations!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
