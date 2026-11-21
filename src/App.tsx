import React from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation
} from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { GenerateQuizPage } from './pages/GenerateQuizPage';
import { ReviewExportPage } from './pages/ReviewExportPage';
import { SoloQuizPage } from './pages/SoloQuizPage';
import { ResultsHistoryPage } from './pages/ResultsHistoryPage';
import { AttemptDetailPage } from './pages/AttemptDetailPage';
import { LiveLobbyPage } from './pages/LiveLobbyPage';
import { LiveLeaderboardPage } from './pages/LiveLeaderboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { AdminPage } from './pages/AdminPage';

const RequireAuth: React.FC = () => {
  const { user, authLoading, t } = useApp();
  const location = useLocation();

  if (authLoading) {
    return (
      <div
        className="home-frame"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <p className="helper-text">{t('auth.submitting')}</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

const GuestOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authLoading } = useApp();

  if (authLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing / Home Page */}
          <Route path="/" element={<HomePage />} />

          {/* Public Auth Pages */}
          <Route
            path="/login"
            element={
              <GuestOnly>
                <AuthPage mode="login" />
              </GuestOnly>
            }
          />
          <Route
            path="/register"
            element={
              <GuestOnly>
                <AuthPage mode="register" />
              </GuestOnly>
            }
          />
          <Route path="/verify-email" element={<AuthPage mode="verify" />} />
          <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
          <Route path="/reset-password" element={<AuthPage mode="reset" />} />

          {/* Public & Guest-Accessible Live Game Routes inside AppLayout */}
          <Route element={<AppLayout />}>
            {/* Screen 06: Live Game Lobby (Guests can join via PIN; Hosts sign in to create) */}
            <Route path="/lobby" element={<LiveLobbyPage />} />
            <Route path="/rooms/:pin" element={<LiveLobbyPage />} />
            <Route path="/s6" element={<LiveLobbyPage />} />

            {/* Screen 07: Live Leaderboard */}
            <Route path="/leaderboard" element={<LiveLeaderboardPage />} />
            <Route path="/s7" element={<LiveLeaderboardPage />} />
          </Route>

          {/* Protected Workspace Routes (Authenticated Users Only) */}
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              {/* Screen 01: Dashboard */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/s1" element={<DashboardPage />} />

              {/* Screen 02: Generate Quiz */}
              <Route path="/generate" element={<GenerateQuizPage />} />
              <Route path="/upload" element={<GenerateQuizPage />} />
              <Route path="/s2" element={<GenerateQuizPage />} />

              {/* Screen 03: Review & Export / My Quizzes */}
              <Route path="/quizzes" element={<ReviewExportPage />} />
              <Route path="/quizzes/:id" element={<ReviewExportPage />} />
              <Route path="/quizzes/:id/preview" element={<ReviewExportPage />} />
              <Route path="/quizzes/:id/export" element={<ReviewExportPage />} />
              <Route path="/s3" element={<ReviewExportPage />} />

              {/* Screen 04: Solo Quiz */}
              <Route path="/play" element={<SoloQuizPage />} />
              <Route path="/quizzes/:id/play" element={<SoloQuizPage />} />
              <Route path="/s4" element={<SoloQuizPage />} />

              {/* Screen 05: Results & History */}
              <Route path="/history" element={<ResultsHistoryPage />} />
              <Route path="/results" element={<ResultsHistoryPage />} />
              <Route path="/attempts/:id" element={<AttemptDetailPage />} />
              <Route path="/s5" element={<ResultsHistoryPage />} />

              {/* Screen 08: Settings */}
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/s8" element={<SettingsPage />} />

              {/* Raw Admin Console */}
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
