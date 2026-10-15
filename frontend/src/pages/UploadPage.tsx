import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { uploadSighting } from '../api/sightingsApi';
import type { UploadResponse, CandidatePrediction } from '../api/sightingsApi';
import { useAuthStore } from '../store/authStore';

interface OfflineSighting {
  id: string;
  photoDataUrl: string;
  latitude: string;
  longitude: string;
  notes: string;
  timestamp: string;
}

export const UploadPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<string>('28.6139');
  const [longitude, setLongitude] = useState<string>('77.2090');
  const [gpsStatus, setGpsStatus] = useState<'detecting' | 'detected' | 'failed'>('detecting');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidatePrediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offlineQueue, setOfflineQueue] = useState<OfflineSighting[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncingOffline, setSyncingOffline] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline queue from localStorage
    const saved = localStorage.getItem('wildbugs_offline_sightings');
    if (saved) {
      try {
        setOfflineQueue(JSON.parse(saved));
      } catch {
        // ignore
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Geolocation
  const requestGps = () => {
    if ('geolocation' in navigator) {
      setGpsStatus('detecting');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          setGpsStatus('detected');
        },
        () => {
          setGpsStatus('failed');
        },
        { timeout: 8000 }
      );
    } else {
      setGpsStatus('failed');
    }
  };

  useEffect(() => {
    requestGps();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError(null);
      } else {
        setError('Please drop an image file (JPEG, PNG, WebP).');
      }
    }
  };

  const saveToOfflineQueue = () => {
    if (!previewUrl) return;
    const offlineItem: OfflineSighting = {
      id: `offline-${Date.now()}`,
      photoDataUrl: previewUrl,
      latitude,
      longitude,
      notes,
      timestamp: new Date().toISOString(),
    };

    const updated = [offlineItem, ...offlineQueue];
    setOfflineQueue(updated);
    try {
      localStorage.setItem('wildbugs_offline_sightings', JSON.stringify(updated));
    } catch {
      // Storage quota safety
    }
    setError(null);
    alert('📍 Sighting queued offline! It will automatically sync when you return to cellular range.');
    resetForm();
  };

  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0 || syncingOffline) return;
    setSyncingOffline(true);

    try {
      for (const item of offlineQueue) {
        const blob = await (await fetch(item.photoDataUrl)).blob();
        const formData = new FormData();
        formData.append('photo', blob, 'offline-bug.jpg');
        formData.append('latitude', item.latitude);
        formData.append('longitude', item.longitude);
        if (item.notes) formData.append('notes', item.notes);

        await uploadSighting(formData);
      }

      setOfflineQueue([]);
      localStorage.removeItem('wildbugs_offline_sightings');
      alert('🎉 All offline field sightings synced successfully to the biodiversity registry!');
    } catch (err) {
      alert('Network sync interrupted. Unsynced sightings remain safely stored in your offline queue.');
    } finally {
      setSyncingOffline(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose or capture a photo first.');
      return;
    }

    // If offline, store in offline queue
    if (isOffline) {
      saveToOfflineQueue();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }
      if (selectedCandidate) {
        formData.append('speciesId', selectedCandidate.species.id.toString());
      }

      const res = await uploadSighting(formData);
      setResult(res);
      if (res.candidates && res.candidates.length > 0) {
        setSelectedCandidate(res.candidates[0]);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze and save sighting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setSelectedCandidate(null);
    setNotes('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Login Required</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
            You need to be logged in to upload insect sightings and log your field observations.
          </p>
          <button onClick={() => navigate('/login')} className="btn" style={{ width: '100%' }}>
            Log in to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '850px', paddingBottom: '4rem' }}>
      {/* Offline Sync Banner */}
      {offlineQueue.length > 0 && (
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1.5px solid #93c5fd',
          borderRadius: 'var(--radius)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <div>
            <strong style={{ color: '#1e40af', fontSize: '0.95rem' }}>
              📡 {offlineQueue.length} Observation{offlineQueue.length === 1 ? '' : 's'} Stored Offline
            </strong>
            <p style={{ color: '#3b82f6', fontSize: '0.85rem' }}>
              Captured without cellular connection. Ready to upload to the regional database.
            </p>
          </div>
          <button
            onClick={syncOfflineQueue}
            disabled={syncingOffline || isOffline}
            className="btn"
            style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
          >
            {syncingOffline ? 'Syncing...' : '⚡ Sync to Database'}
          </button>
        </div>
      )}

      {/* Fullscreen analyzing overlay */}
      {isSubmitting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(27, 67, 50, 0.88)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          color: '#ffffff',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#52b788', width: '60px', height: '60px' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '1.5rem', marginBottom: '0.5rem' }}>
            Analyzing Insect with Multi-Candidate AI...
          </h2>
          <p style={{ fontSize: '1.05rem', opacity: 0.9, maxWidth: '450px' }}>
            Classifying taxonomic traits, wing patterns, and morphological probabilities.
          </p>
        </div>
      )}

      {/* Page Heading */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>
            📸 Record Sighting & AI Vision
          </h1>
          {isOffline && (
            <span className="badge badge-yellow">
              📡 Wild Mode (Offline Active)
            </span>
          )}
        </div>
        <p style={{ color: 'var(--text-light)', fontSize: '1rem' }}>
          Upload or capture a photo. WildBugs AI presents top taxonomic candidates and logs your discovery.
        </p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* SUCCESS RESULT CARD WITH CANDIDATES */}
      {result ? (
        <div className="card" style={{
          padding: '2.5rem 2rem',
          border: '2px solid var(--accent)',
          background: 'linear-gradient(180deg, #ffffff 0%, #f4fbf7 100%)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-light)', color: 'var(--primary-dark)', fontWeight: 700, padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.85rem' }}>
              ✓ Identification Complete & Saved
            </div>

            {result.newBadges && result.newBadges.length > 0 && (
              <span className="badge" style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '0.35rem 0.75rem' }}>
                🎉 New Badge Unlocked!
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 320px) 1fr', gap: '2rem', alignItems: 'start' }}>
            {/* Uploaded Photo */}
            <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', height: '260px', backgroundColor: '#e5e7eb' }}>
              <img
                src={previewUrl || `http://localhost:3001${result.sighting.photoUrl}`}
                alt="Captured Insect"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* AI Identification Details */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                {selectedCandidate?.species?.family || result.species?.family || 'Identified Specimen'}
              </div>

              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.2rem' }}>
                {selectedCandidate?.species?.commonName || result.species?.commonName || 'Insect Specimen'}
              </h2>

              <p style={{ fontStyle: 'italic', color: 'var(--text-light)', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                {selectedCandidate?.species?.scientificName || result.species?.scientificName}
              </p>

              {result.aiModel && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--primary-dark)',
                  backgroundColor: '#ecfdf5',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  marginBottom: '0.75rem',
                }}>
                  ⚡ Engine: {result.aiModel}
                </div>
              )}

              {result.aiNotes && (
                <div style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-light)',
                  fontStyle: 'italic',
                  marginBottom: '1rem',
                  backgroundColor: '#f8fafc',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius)',
                  borderLeft: '3px solid var(--accent)',
                }}>
                  🔬 Diagnostic: {result.aiNotes}
                </div>
              )}

              {/* Confidence Meter */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <span>AI Match Probability</span>
                  <span style={{ color: 'var(--primary-dark)' }}>
                    {Math.round((selectedCandidate?.confidence || result.confidence) * 100)}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '10px', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.round((selectedCandidate?.confidence || result.confidence) * 100)}%`,
                    height: '100%',
                    backgroundColor: (selectedCandidate?.confidence || result.confidence) >= 0.75 ? '#2d6a4f' : '#f59e0b',
                    transition: 'width 0.8s ease-in-out',
                  }} />
                </div>
              </div>

              {/* TOP 3 CANDIDATES PICKER */}
              {result.candidates && result.candidates.length > 1 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Alternative Predictions
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {result.candidates.map((cand, idx) => {
                      const isSelected = selectedCandidate?.species?.id === cand.species.id;
                      return (
                        <div
                          key={cand.species.id}
                          onClick={() => setSelectedCandidate(cand)}
                          style={{
                            padding: '0.65rem 0.85rem',
                            borderRadius: 'var(--radius)',
                            border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                            backgroundColor: isSelected ? 'rgba(45, 106, 79, 0.08)' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.875rem',
                          }}
                        >
                          <div>
                            <strong>#{idx + 1} {cand.species.commonName}</strong>
                            <span style={{ fontStyle: 'italic', color: 'var(--text-light)', marginLeft: '0.5rem' }}>
                              ({cand.species.scientificName})
                            </span>
                          </div>
                          <span style={{ fontWeight: 700, color: isSelected ? 'var(--primary-dark)' : 'var(--text-light)' }}>
                            {Math.round(cand.confidence * 100)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to="/map" className="btn" style={{ padding: '0.65rem 1.15rem' }}>
                  🗺️ View on Map
                </Link>
                <Link to={`/sighting/${result.sighting.id}`} className="btn btn-outline" style={{ padding: '0.65rem 1.15rem' }}>
                  🔍 View & Verify Details
                </Link>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn"
                  style={{ background: '#e5e7eb', color: 'var(--text)', padding: '0.65rem 1.15rem' }}
                >
                  📸 Upload Another
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* UPLOAD FORM */
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2.5px dashed var(--accent)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: previewUrl ? '#f0fdf4' : '#f8faf9',
              padding: previewUrl ? '1rem' : '3.5rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: '1.75rem',
              transition: 'background-color 0.2s, border-color 0.2s',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {previewUrl ? (
              <div>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    maxHeight: '280px',
                    maxWidth: '100%',
                    borderRadius: 'var(--radius)',
                    objectFit: 'contain',
                    marginBottom: '1rem',
                  }}
                />
                <div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="btn btn-outline"
                    style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
                  >
                    🔄 Choose Different Photo
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📸</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.35rem' }}>
                  Tap to capture or drop an insect photo here
                </h3>
                <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                  Supports live field camera capture, or JPEG/PNG/WebP up to 10MB
                </p>
              </div>
            )}
          </div>

          {/* Location Detection Section */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>📍 Sighting Coordinates</label>
                <button
                  type="button"
                  onClick={requestGps}
                  style={{
                    background: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  {gpsStatus === 'detecting' ? 'Detecting...' : '↻ Refresh GPS'}
                </button>
              </div>
              {gpsStatus === 'detected' && (
                <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>
                  ✓ Live GPS Location Detected
                </span>
              )}
              {gpsStatus === 'detecting' && (
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                  📡 Acquiring satellite fix...
                </span>
              )}
              {gpsStatus === 'failed' && (
                <span style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 600 }}>
                  ⚠️ GPS unavailable — using regional defaults
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Latitude</span>
                <input
                  type="number"
                  step="any"
                  className="input"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  required
                />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Longitude</span>
                <input
                  type="number"
                  step="any"
                  className="input"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Notes textarea */}
          <div className="form-group">
            <label className="form-label">Field Observer Notes (Optional)</label>
            <textarea
              className="input"
              rows={3}
              placeholder="e.g. Found on damp bark near pond during sunny afternoon..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn"
            disabled={!selectedFile || isSubmitting}
            style={{ width: '100%', padding: '0.85rem', fontSize: '1.05rem', fontWeight: 700 }}
          >
            {isOffline ? '💾 Save to Offline Queue' : '🔍 Upload & Identify Specimen'}
          </button>
        </form>
      )}
    </div>
  );
};
