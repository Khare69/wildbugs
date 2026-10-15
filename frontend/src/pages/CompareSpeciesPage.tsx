import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSpecies } from '../api/speciesApi';
import type { Species } from '../api/speciesApi';

// Curated Lookalike Pairs for rapid field comparison
const CURATED_PAIRS = [
  {
    title: 'Honeybee vs Bumblebee',
    desc: 'Slender hive pollinator vs robust fuzzy buzz-pollinator',
    names: ['Honeybee', 'Buff-Tailed Bumblebee'],
  },
  {
    title: 'Luna Moth vs Atlas Moth',
    desc: 'Lime-green tailed night flier vs world’s largest cobra-wing moth',
    names: ['Luna Moth', 'Atlas Moth'],
  },
  {
    title: 'Praying Mantis vs Stick Insect',
    desc: 'Raptorial ambush hunter vs twig-mimicking herbivore',
    names: ['Praying Mantis', 'Indian Stick Insect'],
  },
  {
    title: 'Ladybug vs Firefly',
    desc: 'Hard-shelled dome beetle vs soft-bodied bioluminescent beetle',
    names: ['Seven-Spotted Ladybug', 'Common Eastern Firefly'],
  },
];

// Helper to provide specific anatomical field notes
function getAnatomicalTraits(species: Species) {
  const name = species.commonName.toLowerCase();
  if (name.includes('honeybee')) {
    return {
      bodyType: 'Slender, golden-amber striped abdomen with subtle fuzz',
      wings: 'Two pairs of membranous wings hooked via hamuli',
      defense: 'Barbed stinger (single use against mammals; defensive)',
      activity: 'Diurnal; peak sunlight foraging (15°C+)',
      lookalikeDanger: 'Often confused with hoverflies and wasps; non-aggressive unless hive threatened.',
    };
  }
  if (name.includes('bumblebee')) {
    return {
      bodyType: 'Heavily built, dense black & yellow pile with buff/white tail',
      wings: 'Rapid vibration flight capable of sonic buzz pollination',
      defense: 'Smooth stinger (can sting repeatedly; rarely attacks)',
      activity: 'Diurnal; active in cooler temperatures and light rain',
      lookalikeDanger: 'Docile pollinator; essential for deep floral bells.',
    };
  }
  if (name.includes('luna moth')) {
    return {
      bodyType: 'Plump white fuzzy body with lime-green leafy wings',
      wings: 'Elongated ribbon-like hindwing tails designed to disrupt bat echolocation',
      defense: 'Adults lack mouthparts; short-lived cryptic night camouflage',
      activity: 'Strictly nocturnal; attracted to low ultraviolet lights',
      lookalikeDanger: 'Often mistaken for leaves; harmless silk moth.',
    };
  }
  if (name.includes('atlas moth')) {
    return {
      bodyType: 'Massive wingspan (up to 28 cm); rust-red and tawny patterns',
      wings: 'Prominent translucent triangular windows and cobra-head wingtips',
      defense: 'Snake head visual mimicry frightens insectivorous birds',
      activity: 'Nocturnal / Crepuscular; weak, fluttering flight pattern',
      lookalikeDanger: 'Giant size can be intimidating, but completely harmless.',
    };
  }
  if (name.includes('mantis')) {
    return {
      bodyType: 'Elongated prothorax with 180° mobile triangular head',
      wings: 'Folded flat along abdomen; forelegs modified into serrated raptorial claws',
      defense: 'Menacing deimatic threat display; powerful strike grasp',
      activity: 'Diurnal ambush predator; waits motionless in vegetation',
      lookalikeDanger: 'Harmless to humans; beneficial garden apex predator.',
    };
  }
  if (name.includes('stick insect')) {
    return {
      bodyType: 'Extremely thin, cylindrical body mimicking green or brown twigs',
      wings: 'Wingless; slow swaying movement mimicking twigs in wind',
      defense: 'Thanatosis (feigning death) and cryptic twig camouflage',
      activity: 'Nocturnal herbivore; feeds undisturbed after dusk',
      lookalikeDanger: 'Totally defenseless herbivore; reproduces by parthenogenesis.',
    };
  }
  if (name.includes('ladybug')) {
    return {
      bodyType: 'Convex hemispherical dome with hardened red elytra and 7 black spots',
      wings: 'Flight wings tucked safely beneath protective elytra shells',
      defense: 'Reflex bleeding of toxic, foul-tasting alkaloids from joints',
      activity: 'Diurnal; prowls vegetation stems for aphid colonies',
      lookalikeDanger: 'Often confused with Asian lady beetle (Harmonia axyridis).',
    };
  }
  if (name.includes('firefly')) {
    return {
      bodyType: 'Elongated, flattened, soft-bodied beetle with dark brown pronotum',
      wings: 'Soft flexible wing covers; abdomen contains luminescent photocytes',
      defense: 'Lucibufagins (steroid toxins) emit acrid odor to ward off birds',
      activity: 'Twilight and nocturnal; produces green-yellow cold chemical light',
      lookalikeDanger: 'Mistaken for soldier beetles; highly sensitive to light pollution.',
    };
  }
  // Generic fallback
  return {
    bodyType: `${species.family} characteristic invertebrate morphology`,
    wings: 'Species-adapted aerodynamic wing or elytra structure',
    defense: 'Aposematic coloration or natural behavioral camouflage',
    activity: 'Seasonal diurnal/nocturnal activity pattern',
    lookalikeDanger: 'Observe closely with hand lens for key diagnostic veins.',
  };
}

export const CompareSpeciesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const speciesAId = searchParams.get('a');
  const speciesBId = searchParams.get('b');

  const { data, isLoading } = useQuery({
    queryKey: ['species'],
    queryFn: () => fetchSpecies(),
  });

  const speciesList = data?.species || [];

  // Default selection if not present
  const [selectedA, setSelectedA] = useState<number | null>(null);
  const [selectedB, setSelectedB] = useState<number | null>(null);

  useEffect(() => {
    if (speciesList.length > 0) {
      let a = speciesAId ? parseInt(speciesAId, 10) : speciesList[0].id;
      if (isNaN(a) || !speciesList.some((s) => s.id === a)) {
        a = speciesList[0].id;
      }

      let b = speciesBId ? parseInt(speciesBId, 10) : (speciesList[1]?.id || speciesList[0].id);
      if (isNaN(b) || !speciesList.some((s) => s.id === b)) {
        b = speciesList[1]?.id || speciesList[0].id;
      }

      setSelectedA(a);
      setSelectedB(b);
    }
  }, [speciesList, speciesAId, speciesBId]);

  const updateSelection = (newA: number, newB: number) => {
    setSelectedA(newA);
    setSelectedB(newB);
    setSearchParams({ a: String(newA), b: String(newB) });
  };

  const handleSwap = () => {
    if (selectedA && selectedB) {
      updateSelection(selectedB, selectedA);
    }
  };

  const selectPreset = (names: string[]) => {
    const s1 = speciesList.find((s) => s.commonName.toLowerCase().includes(names[0].toLowerCase()));
    const s2 = speciesList.find((s) => s.commonName.toLowerCase().includes(names[1].toLowerCase()));
    if (s1 && s2) {
      updateSelection(s1.id, s2.id);
    }
  };

  const speciesA = speciesList.find((s) => s.id === selectedA);
  const speciesB = speciesList.find((s) => s.id === selectedB);

  const traitsA = speciesA ? getAnatomicalTraits(speciesA) : null;
  const traitsB = speciesB ? getAnatomicalTraits(speciesB) : null;

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>Loading specimen database...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '5rem', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#ecfdf5',
          color: 'var(--primary-dark)',
          fontWeight: 700,
          fontSize: '0.85rem',
          padding: '0.35rem 0.85rem',
          borderRadius: '9999px',
          marginBottom: '0.75rem',
        }}>
          🔬 Citizen-Science Diagnostic Matrix
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
          Lookalike Species Spotter
        </h1>
        <p style={{ color: 'var(--text-light)', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem' }}>
          Distinguish between deceptive entomological mimics, overlapping families, and closely related pollinators side-by-side in the field.
        </p>
      </div>

      {/* Preset Curated Lookalikes Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '1.25rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          ⚡ Fast Field Comparison Presets
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {CURATED_PAIRS.map((pair, idx) => (
            <button
              key={idx}
              onClick={() => selectPreset(pair.names)}
              style={{
                textAlign: 'left',
                padding: '0.75rem 1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ecfdf5';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-dark)', marginBottom: '0.2rem' }}>
                {pair.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', lineHeight: 1.3 }}>
                {pair.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selectors Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
      }}>
        {/* Selector A */}
        <div style={{ flex: '1 1 300px' }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.35rem', color: 'var(--primary)' }}>
            Specimen A (Reference)
          </label>
          <select
            value={selectedA || ''}
            onChange={(e) => updateSelection(Number(e.target.value), selectedB || 0)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius)',
              border: '1.5px solid var(--primary)',
              fontWeight: 600,
              fontSize: '1rem',
              backgroundColor: '#ffffff',
            }}
          >
            {speciesList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.commonName} ({s.scientificName})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingTop: '1.25rem' }}>
          <button
            onClick={handleSwap}
            className="btn btn-outline"
            title="Swap species"
            style={{
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              borderColor: 'var(--primary)',
              color: 'var(--primary)',
            }}
          >
            ⇄
          </button>
        </div>

        {/* Selector B */}
        <div style={{ flex: '1 1 300px' }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.35rem', color: 'var(--secondary)' }}>
            Specimen B (Lookalike / Comparison)
          </label>
          <select
            value={selectedB || ''}
            onChange={(e) => updateSelection(selectedA || 0, Number(e.target.value))}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius)',
              border: '1.5px solid var(--secondary)',
              fontWeight: 600,
              fontSize: '1rem',
              backgroundColor: '#ffffff',
            }}
          >
            {speciesList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.commonName} ({s.scientificName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {speciesA && speciesB && traitsA && traitsB && (
        <>
          {/* Side-by-Side Visual Specimen Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}>
            {/* Card A */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', borderTop: '4px solid var(--primary)' }}>
              <div style={{ height: '260px', backgroundColor: '#f1f5f9', position: 'relative' }}>
                <img
                  src={speciesA.imageUrl}
                  alt={speciesA.commonName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600';
                  }}
                />
                <span className="badge badge-green" style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                  {speciesA.family} Family
                </span>
                <span className="badge" style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: '#ffffff', color: '#000000' }}>
                  Status: {speciesA.conservationStatus}
                </span>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.2rem' }}>
                  {speciesA.commonName}
                </h2>
                <div style={{ fontStyle: 'italic', color: 'var(--text-light)', marginBottom: '1rem', fontSize: '1.05rem' }}>
                  {speciesA.scientificName}
                </div>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text)', marginBottom: '1.25rem' }}>
                  {speciesA.description}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Link to={`/species/${speciesA.id}`} className="btn" style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}>
                    Full Field Guide →
                  </Link>
                  <Link to={`/upload`} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}>
                    Log Sighting
                  </Link>
                </div>
              </div>
            </div>

            {/* Card B */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', borderTop: '4px solid var(--secondary)' }}>
              <div style={{ height: '260px', backgroundColor: '#f1f5f9', position: 'relative' }}>
                <img
                  src={speciesB.imageUrl}
                  alt={speciesB.commonName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600';
                  }}
                />
                <span className="badge badge-yellow" style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                  {speciesB.family} Family
                </span>
                <span className="badge" style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: '#ffffff', color: '#000000' }}>
                  Status: {speciesB.conservationStatus}
                </span>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.2rem' }}>
                  {speciesB.commonName}
                </h2>
                <div style={{ fontStyle: 'italic', color: 'var(--text-light)', marginBottom: '1rem', fontSize: '1.05rem' }}>
                  {speciesB.scientificName}
                </div>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text)', marginBottom: '1.25rem' }}>
                  {speciesB.description}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Link to={`/species/${speciesB.id}`} className="btn" style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem', backgroundColor: 'var(--secondary)' }}>
                    Full Field Guide →
                  </Link>
                  <Link to={`/upload`} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}>
                    Log Sighting
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Comparison Matrix Table */}
          <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '1.25rem' }}>
              🔬 Diagnostic Field Key Matrix
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', width: '22%', color: 'var(--text-light)' }}>
                      Diagnostic Trait
                    </th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', width: '39%', color: 'var(--primary)', fontWeight: 800 }}>
                      {speciesA.commonName}
                    </th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', width: '39%', color: 'var(--secondary)', fontWeight: 800 }}>
                      {speciesB.commonName}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-light)' }}>
                      Taxonomic Family
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{speciesA.family}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{speciesB.family}</td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#fcfcfd' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-light)' }}>
                      Body Structure & Pile
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>{traitsA.bodyType}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>{traitsB.bodyType}</td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-light)' }}>
                      Wings & Aerodynamics
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>{traitsA.wings}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>{traitsB.wings}</td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#fcfcfd' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-light)' }}>
                      Defense & Stinger/Venom
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>{traitsA.defense}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>{traitsB.defense}</td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-light)' }}>
                      Preferred Habitat
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>{speciesA.habitat}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>{speciesB.habitat}</td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#fcfcfd' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-light)' }}>
                      Foraging Diet
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>{speciesA.diet}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>{speciesB.diet}</td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-light)' }}>
                      Diurnal / Temporal Rhythm
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>{traitsA.activity}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>{traitsB.activity}</td>
                  </tr>

                  <tr style={{ backgroundColor: '#fff7ed' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#c2410c' }}>
                      ⚠️ Field Identification Note
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem' }}>{traitsA.lookalikeDanger}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem' }}>{traitsB.lookalikeDanger}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Summary Takeaway Card */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
            border: '1.5px solid var(--accent)',
            borderRadius: 'var(--radius)',
            padding: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}>
            <div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.4rem' }}>
                Field Pro-Tip for Naturalists
              </h4>
              <p style={{ color: 'var(--text)', maxWidth: '650px', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                When photographing specimens for AI recognition, capture high-contrast shots of both dorsal (wings open) and lateral (head, legs, antennae) perspectives to guarantee reliable species classification.
              </p>
            </div>
            <Link to="/upload" className="btn" style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>
              📸 Test AI Identification
            </Link>
          </div>
        </>
      )}
    </div>
  );
};
