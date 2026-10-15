import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSpeciesById } from '../api/speciesApi';

export const SpeciesDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const stopTimeoutRef = useRef<any>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['species', id],
    queryFn: () => fetchSpeciesById(id!),
    enabled: !!id,
  });

  const species = data?.species;

  // Synthesize species acoustic audio call
  const stopAudio = () => {
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
    }
    setIsPlayingAudio(false);
  };

  const playSpeciesAudio = async () => {
    if (isPlayingAudio) {
      stopAudio();
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const fam = species?.family || '';

      if (fam === 'Apidae') {
        // Pollinator Bee Buzz: 235Hz saw wave with mild low-pass flutter
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(235, now);
        gain.gain.setValueAtTime(0.14, now);
        // Tremolo
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(8, now);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.04, now);
        lfo.connect(gain.gain);
        lfo.start();
      } else if (fam === 'Cicadidae') {
        // Cicada Chorus: 4400Hz pulsating high frequency
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(4400, now);
        gain.gain.setValueAtTime(0.12, now);
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(14, now);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.08, now);
        lfo.connect(gain.gain);
        lfo.start();
      } else if (fam === 'Acrididae') {
        // Grasshopper stridulation
        osc.type = 'sine';
        osc.frequency.setValueAtTime(4800, now);
        gain.gain.setValueAtTime(0.1, now);
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(10, now);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.06, now);
        lfo.connect(gain.gain);
        lfo.start();
      } else {
        // Soft nature chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(640, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setIsPlayingAudio(true);

      stopTimeoutRef.current = setTimeout(() => {
        stopAudio();
      }, 5000);
    } catch (err) {
      console.error('Audio playback error:', err);
      setIsPlayingAudio(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
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

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error || !species) {
    return (
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--danger)' }}>Species Not Found</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
            We could not find the requested insect species in our registry.
          </p>
          <Link to="/species" className="btn">
            ← Return to Species Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* Navigation Breadcrumb */}
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
          ← Back to Catalog
        </button>
      </div>

      {/* Main Header Card */}
      <div className="card" style={{
        marginBottom: '2rem',
        overflow: 'hidden',
        padding: 0,
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 450px) 1fr',
        gap: '0',
      }}>
        {/* Large Image Banner */}
        <div style={{ height: '100%', minHeight: '300px', backgroundColor: '#e5e7eb' }}>
          <img
            src={species.imageUrl}
            alt={species.commonName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600';
            }}
          />
        </div>

        {/* Header Details */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{
              background: 'var(--accent-light)',
              color: 'var(--primary-dark)',
              fontWeight: 700,
              fontSize: '0.8rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              textTransform: 'uppercase',
            }}>
              {species.family} Family
            </span>
            {getStatusBadge(species.conservationStatus)}
          </div>

          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>
            {species.commonName}
          </h1>

          <p style={{ fontStyle: 'italic', fontSize: '1.2rem', color: 'var(--text-light)', marginBottom: '1.25rem' }}>
            {species.scientificName}
          </p>

          <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--text)', marginBottom: '1.75rem' }}>
            {species.description}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/map" className="btn">
              🗺️ View Sightings on Map
            </Link>
            <Link
              to={`/species/compare?a=${species.id}`}
              className="btn btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              ⚖️ Compare Lookalikes
            </Link>
            <Link to="/upload" className="btn btn-outline">
              📸 Log Sighting
            </Link>
          </div>
        </div>
      </div>

      {/* INSECT AUDIO FIELD GUIDE CARD */}
      <div className="card" style={{
        marginBottom: '2rem',
        padding: '1.5rem 2rem',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
        border: '1.5px solid var(--accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button
            onClick={playSpeciesAudio}
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: isPlayingAudio ? '#dc2626' : 'var(--primary)',
              color: '#ffffff',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(45, 106, 79, 0.25)',
              transition: 'transform 0.15s, background-color 0.2s',
            }}
          >
            {isPlayingAudio ? '⏸' : '▶'}
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                Bio-Acoustic Call & Wing Frequency
              </h3>
              {isPlayingAudio && (
                <span className="badge badge-green" style={{ animation: 'pulse 1.5s infinite' }}>
                  🔊 Playing (Synthesized)
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
              Listen to the acoustic stridulation and flight vibration frequency of {species.commonName}.
            </p>
          </div>
        </div>

        {/* Animated Sound Wave Bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '36px' }}>
          {[16, 28, 20, 34, 18, 26, 30, 22].map((height, i) => (
            <div
              key={i}
              style={{
                width: '5px',
                height: isPlayingAudio ? `${height}px` : '6px',
                backgroundColor: isPlayingAudio ? 'var(--accent)' : '#d1d5db',
                borderRadius: '9999px',
                transition: 'height 0.25s ease-in-out',
                animation: isPlayingAudio ? `soundWave 0.${6 + (i % 4)}s ease-in-out infinite alternate` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Facts Grid */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--primary-dark)' }}>
        Biological Profile & Field Guide
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Habitat */}
        <div className="card">
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏡</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Habitat & Environment</h3>
          <p style={{ color: 'var(--text-light)', fontSize: '0.925rem', lineHeight: 1.5 }}>
            {species.habitat}
          </p>
        </div>

        {/* Diet */}
        <div className="card">
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍃</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Diet & Foraging</h3>
          <p style={{ color: 'var(--text-light)', fontSize: '0.925rem', lineHeight: 1.5 }}>
            {species.diet}
          </p>
        </div>

        {/* Lifecycle */}
        <div className="card">
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔄</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Lifecycle & Metamorphosis</h3>
          <p style={{ color: 'var(--text-light)', fontSize: '0.925rem', lineHeight: 1.5 }}>
            {species.lifecycle}
          </p>
        </div>

        {/* Taxonomic Family */}
        <div className="card">
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧬</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Taxonomic Family</h3>
          <p style={{ color: 'var(--text-light)', fontSize: '0.925rem', lineHeight: 1.5 }}>
            Belongs to the <strong>{species.family}</strong> family. Key evolutionary traits are adapted for regional pollination and ecosystem balance.
          </p>
        </div>
      </div>
    </div>
  );
};
