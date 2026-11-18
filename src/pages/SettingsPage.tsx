import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { UserSettings } from '../types/quiz';
import {
  PageHeader,
  SectionCard,
  SettingToggleRow,
  ThemeSwitch
} from '../components/common';

export const SettingsPage: React.FC = () => {
  const {
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

  const activeTab: UserSettings['tab'] = tabs.includes(settings.tab)
    ? settings.tab
    : 'Profile';

  const handleSave = () => {
    updateSettings({
      displayName: displayName.trim() || 'Alex M.',
      email: email.trim() || 'alex.m@example.com',
      defaultQuestions,
      difficulty,
      language
    });
    showToast('Your preferences have been saved.');
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
    showToast('Study data has been exported as a JSON file.');
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
    <div className="settings-page-layout">
      <div className="settings-sticky-head">
        <PageHeader
          eyebrow="YOUR STUDY SPACE / 08"
          title="Settings"
          subtitle="Make AutoQuiz work the way you learn."
          dataName="Settings heading"
        >
          <div className="settings-tabs" role="tablist" aria-label="Settings sections">
            {tabs.map((tab) => {
              const isSelected = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`settings-tab ${isSelected ? 'active' : ''}`}
                  onClick={() => updateSettings({ tab })}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </PageHeader>
      </div>

      <div className="settings-tab-panel" role="tabpanel">
        {/* Tab 1: Profile & Theme Appearance */}
        {activeTab === 'Profile' && (
          <SectionCard
            title="Profile & Appearance"
            headerRight={<ThemeSwitch variant="card" />}
            headerStyle={{ marginBottom: 16 }}
            dataName="Profile"
          >
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
          </SectionCard>
        )}

        {/* Tab 2: Quiz Defaults */}
        {activeTab === 'Quiz defaults' && (
          <SectionCard dataName="Quiz defaults">
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

            <SettingToggleRow
              label="Shuffle questions"
              description="Keep each practice session a little different."
              checked={settings.shuffleQuestions}
              onToggle={() =>
                updateSettings({ shuffleQuestions: !settings.shuffleQuestions })
              }
            />

            <SettingToggleRow
              label="Show explanations after each answer"
              description="Learn as you go in solo practice."
              checked={settings.showExplanations}
              onToggle={() =>
                updateSettings({ showExplanations: !settings.showExplanations })
              }
            />
          </SectionCard>
        )}

        {/* Tab 3: Notifications */}
        {activeTab === 'Notifications' && (
          <SectionCard dataName="Notifications">
            <h2 className="section-title" style={{ marginBottom: 4 }}>
              Notifications
            </h2>
            <p className="helper-text" style={{ marginBottom: 16 }}>
              Choose how and when AutoQuiz keeps you updated on your study progress.
            </p>

            <SettingToggleRow
              label="Study reminders"
              description="A gentle email reminder to keep your revision on track."
              checked={settings.studyReminders}
              onToggle={() =>
                updateSettings({ studyReminders: !settings.studyReminders })
              }
            />

            <SettingToggleRow
              label="Weekly progress summary"
              description="Your completed quizzes, scores, and study activity."
              checked={settings.weeklySummary}
              onToggle={() =>
                updateSettings({ weeklySummary: !settings.weeklySummary })
              }
            />
          </SectionCard>
        )}

        {/* Tab 4: Privacy & Account */}
        {activeTab === 'Privacy & account' && (
          <SectionCard dataName="Privacy and account">
            <h2 className="section-title" style={{ marginBottom: 4 }}>
              Privacy &amp; account
            </h2>
            <p className="helper-text" style={{ marginBottom: 16 }}>
              Manage your local workspace data, exports, and account preferences.
            </p>
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
          </SectionCard>
        )}
      </div>

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
    </div>
  );
};
