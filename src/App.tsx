import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { GenerateQuizPage } from './pages/GenerateQuizPage';
import { ReviewExportPage } from './pages/ReviewExportPage';
import { SoloQuizPage } from './pages/SoloQuizPage';
import { ResultsHistoryPage } from './pages/ResultsHistoryPage';
import { LiveLobbyPage } from './pages/LiveLobbyPage';
import { LiveLeaderboardPage } from './pages/LiveLeaderboardPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Screen 01: Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
            <Route path="/attempts/:id" element={<ResultsHistoryPage />} />
            <Route path="/s5" element={<ResultsHistoryPage />} />

            {/* Screen 06: Live Game Lobby */}
            <Route path="/lobby" element={<LiveLobbyPage />} />
            <Route path="/rooms/:pin" element={<LiveLobbyPage />} />
            <Route path="/s6" element={<LiveLobbyPage />} />

            {/* Screen 07: Live Leaderboard */}
            <Route path="/leaderboard" element={<LiveLeaderboardPage />} />
            <Route path="/s7" element={<LiveLeaderboardPage />} />

            {/* Screen 08: Settings */}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/s8" element={<SettingsPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
