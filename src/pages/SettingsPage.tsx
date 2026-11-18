import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { UserSettings } from '../types/quiz';

export const SettingsPage: React.FC = () => {
  const {
    theme,
    setTheme,
    quizzes,
    history,
    settings,
    updateSettings,
    resetAllData,
    openModal,
    showToast
  } = useApp();

  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState<string>(settings.displayName);
  const [email, setEmail] = useState<string>(settings.email);
  const [defaultQuestions, setDefaultQuestions] = useState<number>(
    settings.defaultQuestions
  );
  const [difficulty, setDifficulty] = useState<string>(settings.difficulty);
  const [language, setLanguage] = useState<string>(settings.language);

  const tabs: UserSettings['tab'][] = [
    'Profile',
    'Quiz defaults',
    'Notifications',
    'Privacy & account'
  ];

  const handleSave = () => {
    updateSettings({
      displayName: displayName.trim() || 'Alex M.',
      email: email.trim() || 'alex.m@example.com',
      defaultQuestions,
      difficulty,
      language
    });
    showToast('Preferences saved.');
  };

  const handleExportData = () => {
    const blob = new Blob(
      [JSON.stringify({ quizzes, history, settings }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'autoquiz-study-data.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported study data JSON.');
  };

  const handleDeleteAccountPrompt = () => {
    openModal({
      title: 'Reset local workspace data?',
      message:
        'This will reset your saved quizzes, attempt history, and preferences back to the initial demo state.',
      confirmLabel: 'Reset data',
      onConfirm: () => {
        resetAllData();
        navigate('/');
      }
    });
  };

  return (
    <>
      <div className="page-heading" data-name="Settings heading">
        <div className="heading-copy">
          <div className="eyebrow">YOUR STUDY SPACE / 08</div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Make AutoQuiz work the way you learn.</p>

          <div className="settings-tabs" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`settings-tab ${settings.tab === tab ? 'active' : ''}`}
                onClick={() => updateSettings({ tab })}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Profile & Theme Appearance */}
      <section className="box-card" data-name="Profile">
        <div className="section-header" style={{ marginBottom: 12 }}>
          <h2 className="section-title">Profile &amp; Appearance</h2>
          <div className="btn-row">
            <button
              type="button"
              className={`btn btn-sm ${theme === 'light' ? 'btn-primary' : ''}`}
              onClick={() => setTheme('light')}
            >
              ☀️ Light (Option A · Platinum #E5E5E5)
            </button>
            <button
              type="button"
              className={`btn btn-sm ${theme === 'dark' ? 'btn-primary' : ''}`}
              onClick={() => setTheme('dark')}
            >
              🌙 Dark (Option D · Jet Black #1A1A1A)
            </button>
          </div>
        </div>

        <div className="grid-2-equal">
          <div className="field-group" style={{ marginBottom: 8 }}>
            <label className="field-label" htmlFor="settings-display-name">
              Display name
            </label>
            <input
              id="settings-display-name"
              className="input"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="field-group" style={{ marginBottom: 8 }}>
            <label className="field-label" htmlFor="settings-email">
              Email address
            </label>
            <input
              id="settings-email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <p className="helper-text">
          Your display name appears in live games and on leaderboards.
        </p>
      </section>

      {/* Quiz Defaults */}
      <section className="box-card" data-name="Quiz defaults">
        <h2 className="section-title" style={{ marginBottom: 4 }}>
          Quiz defaults
        </h2>
        <p className="helper-text" style={{ marginBottom: 16 }}>
          Starting preferences for new quizzes. You can change these each time.
        </p>

        <div className="stat-grid-3" style={{ marginBottom: 16 }}>
          <div className="field-group" style={{ margin: 0 }}>
            <label className="field-label" htmlFor="settings-default-q">
              Number of questions
            </label>
            <select
              id="settings-default-q"
              className="select"
              value={defaultQuestions}
              onChange={(e) => setDefaultQuestions(Number(e.target.value))}
            >
              {[5, 10, 15, 20].map((n) => (
                <option key={n} value={n}>
                  {n} questions
                </option>
              ))}
            </select>
          </div>
          <div className="field-group" style={{ margin: 0 }}>
            <label className="field-label" htmlFor="settings-difficulty">
              Difficulty
            </label>
            <select
              id="settings-difficulty"
              className="select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              {['Mixed', 'Foundational', 'Advanced'].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="field-group" style={{ margin: 0 }}>
            <label className="field-label" htmlFor="settings-language">
              Quiz language
            </label>
            <select
              id="settings-language"
              className="select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {['English', 'Japanese (日本語)', 'Spanish'].map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="toggle-row">
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Shuffle questions</div>
            <div className="helper-text">
              Keep each practice session a little different.
            </div>
          </div>
          <button
            type="button"
            className="switch-btn"
            role="switch"
            aria-checked={settings.shuffleQuestions}
            onClick={() =>
              updateSettings({ shuffleQuestions: !settings.shuffleQuestions })
            }
          >
            <span>{settings.shuffleQuestions ? 'On' : 'Off'}</span>
            <span className="switch-track">
              <span className="switch-thumb"></span>
            </span>
          </button>
        </div>

        <div className="toggle-row">
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              Show explanations after each answer
            </div>
            <div className="helper-text">Learn as you go in solo practice.</div>
          </div>
          <button
            type="button"
            className="switch-btn"
            role="switch"
            aria-checked={settings.showExplanations}
            onClick={() =>
              updateSettings({ showExplanations: !settings.showExplanations })
            }
          >
            <span>{settings.showExplanations ? 'On' : 'Off'}</span>
            <span className="switch-track">
              <span className="switch-thumb"></span>
            </span>
          </button>
        </div>
      </section>

      {/* Notifications */}
      <section className="box-card" data-name="Notifications">
        <h2 className="section-title" style={{ marginBottom: 12 }}>
          Notifications
        </h2>

        <div className="toggle-row" style={{ borderTop: 0 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Study reminders</div>
            <div className="helper-text">
              A gentle email reminder to keep your revision on track.
            </div>
          </div>
          <button
            type="button"
            className="switch-btn"
            role="switch"
            aria-checked={settings.studyReminders}
            onClick={() =>
              updateSettings({ studyReminders: !settings.studyReminders })
            }
          >
            <span>{settings.studyReminders ? 'On' : 'Off'}</span>
            <span className="switch-track">
              <span className="switch-thumb"></span>
            </span>
          </button>
        </div>

        <div className="toggle-row">
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              Weekly progress summary
            </div>
            <div className="helper-text">
              Your completed quizzes, scores, and study activity.
            </div>
          </div>
          <button
            type="button"
            className="switch-btn"
            role="switch"
            aria-checked={settings.weeklySummary}
            onClick={() =>
              updateSettings({ weeklySummary: !settings.weeklySummary })
            }
          >
            <span>{settings.weeklySummary ? 'On' : 'Off'}</span>
            <span className="switch-track">
              <span className="switch-thumb"></span>
            </span>
          </button>
        </div>
      </section>

      {/* Privacy & Account */}
      <section className="box-card" data-name="Privacy and account">
        <h2 className="section-title" style={{ marginBottom: 12 }}>
          Privacy &amp; account
        </h2>
        <div className="banner-row">
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              Your quizzes stay private
            </div>
            <div className="helper-text">
              Only people you share a quiz or game PIN with can join.
            </div>
          </div>
          <div className="btn-row">
            <button type="button" className="btn btn-sm" onClick={handleExportData}>
              Export my data
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={handleDeleteAccountPrompt}
            >
              Delete account
            </button>
          </div>
        </div>
      </section>

      <div className="action-footer-bar" data-name="Save preferences">
        <span className="helper-text">
          Changes apply to future quizzes, not existing ones.
        </span>
        <div className="btn-row">
          <Link to="/" className="btn">
            Cancel
          </Link>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Save changes
          </button>
        </div>
      </div>
    </>
  );
};
