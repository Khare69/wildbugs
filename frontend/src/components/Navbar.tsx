import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: '#ffffff',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0.85rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        {/* Logo */}
        <Link to="/" style={{
          fontSize: '1.35rem',
          fontWeight: 800,
          color: 'var(--primary-dark)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
        }}>
          <span>🪲</span>
          <span>WildBugs</span>
        </Link>

        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          fontSize: '0.95rem',
          fontWeight: 500,
        }}>
          <Link to="/species" style={{ color: 'var(--text)' }}>Species</Link>
          <Link to="/species/compare" style={{ color: 'var(--text)' }}>Compare</Link>
          <Link to="/map" style={{ color: 'var(--text)' }}>Map</Link>
          <Link to="/challenges" style={{ color: 'var(--text)' }}>Challenges</Link>
          <Link to="/leaderboard" style={{ color: 'var(--text)' }}>Leaderboard</Link>
          {user && (
            <Link
              to="/admin"
              style={{
                color: user.role === 'admin' || user.role === 'expert' ? '#166534' : 'var(--text)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <span>🛡️</span>
              <span>Expert Portal</span>
            </Link>
          )}
        </nav>

        {/* Auth CTA & Theme Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          {/* Night Explorer Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '20px',
              border: '1px solid var(--border)',
              backgroundColor: theme === 'dark' ? '#1e293b' : '#f1f5f9',
              color: theme === 'dark' ? '#38bdf8' : '#475569',
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title={theme === 'dark' ? 'Switch to Day Mode' : 'Switch to Night Explorer Mode'}
          >
            <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
            <span>{theme === 'dark' ? 'Night Mode' : 'Day Mode'}</span>
          </button>

          {user ? (
            <>
              <Link to="/upload" className="btn" style={{ padding: '0.45rem 1rem', fontSize: '0.875rem' }}>
                📸 Upload
              </Link>
              <Link to="/profile" style={{
                fontWeight: 600,
                fontSize: '0.9rem',
                color: 'var(--primary-dark)',
                background: 'var(--accent-light)',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
              }}>
                👤 {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: 'var(--text)',
                  padding: '0.45rem 0.75rem',
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn"
                style={{ padding: '0.45rem 1rem', fontSize: '0.875rem' }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
