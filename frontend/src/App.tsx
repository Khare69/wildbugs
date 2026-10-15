import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SpeciesListPage } from './pages/SpeciesListPage';
import { SpeciesDetailPage } from './pages/SpeciesDetailPage';
import { CompareSpeciesPage } from './pages/CompareSpeciesPage';
import { UploadPage } from './pages/UploadPage';
import { SightingDetailPage } from './pages/SightingDetailPage';
import { MapPage } from './pages/MapPage';
import { ProfilePage } from './pages/ProfilePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { useAuthStore } from './store/authStore';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuthStore();
  if (isLoading) return <div className="spinner" />;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/species" element={<SpeciesListPage />} />
          <Route path="/species/compare" element={<CompareSpeciesPage />} />
          <Route path="/species/:id" element={<SpeciesDetailPage />} />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            }
          />
          <Route path="/map" element={<MapPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/sighting/:id" element={<SightingDetailPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;
