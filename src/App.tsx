import React, { Suspense, lazy } from 'react';
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

const HomePage = lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage }))
);
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const GenerateQuizPage = lazy(() =>
  import('./pages/GenerateQuizPage').then((m) => ({ default: m.GenerateQuizPage }))
);
const ReviewExportPage = lazy(() =>
  import('./pages/ReviewExportPage').then((m) => ({ default: m.ReviewExportPage }))
);
const SoloQuizPage = lazy(() =>
  import('./pages/SoloQuizPage').then((m) => ({ default: m.SoloQuizPage }))
);
const ResultsHistoryPage = lazy(() =>
  import('./pages/ResultsHistoryPage').then((m) => ({ default: m.ResultsHistoryPage }))
);
const AttemptDetailPage = lazy(() =>
  import('./pages/AttemptDetailPage').then((m) => ({ default: m.AttemptDetailPage }))
);
const LiveLobbyPage = lazy(() =>
  import('./pages/LiveLobbyPage').then((m) => ({ default: m.LiveLobbyPage }))
);
const LiveLeaderboardPage = lazy(() =>
  import('./pages/LiveLeaderboardPage').then((m) => ({ default: m.LiveLeaderboardPage }))
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const AuthPage = lazy(() =>
  import('./pages/AuthPage').then((m) => ({ default: m.AuthPage }))
);
const AdminPage = lazy(() =>
  import('./pages/AdminPage').then((m) => ({ default: m.AdminPage }))
);

const RouteFallback: React.FC = () => {
  const { t } = useApp();
  return (
    <div
      style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <p className="helper-text">{t('common.loading')}</p>
    </div>
  );
};

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

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authLoading } = useApp();

  if (authLoading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
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

          {/* Standalone Full-Page Live Game Routes (Public & Guest-Accessible) */}
          <Route path="/lobby" element={<LiveLobbyPage />} />
          <Route path="/rooms/:pin" element={<LiveLobbyPage />} />
          <Route path="/s6" element={<LiveLobbyPage />} />
          <Route path="/rooms/:pin/play" element={<LiveLeaderboardPage />} />
          <Route path="/rooms/play" element={<LiveLeaderboardPage />} />
          <Route path="/leaderboard" element={<LiveLeaderboardPage />} />
          <Route path="/s7" element={<LiveLeaderboardPage />} />

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
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminPage />
                  </RequireAdmin>
                }
              />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
