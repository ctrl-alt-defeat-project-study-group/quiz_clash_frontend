import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { AppLanguage, ThemeMode, UserSettings } from '../types/quiz';
import {
  MyanmarFlagIcon,
  PageHeader,
  SectionCard,
  SettingToggleRow,
  UkFlagIcon
} from '../components/common';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export const SettingsPage: React.FC = () => {
  const {
    theme,
    setTheme,
    uiLanguage,
    setUiLanguage,
    quizzes,
    history,
    settings,
    updateSettings,
    resetAllData,
    openModal,
    showToast,
    t
  } = useApp();

  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState<string>(settings.displayName);
  const [email, setEmail] = useState<string>(settings.email);
  const [defaultQuestions, setDefaultQuestions] = useState<number>(
    settings.defaultQuestions
  );
  const [difficulty, setDifficulty] = useState<string>(settings.difficulty);
  const [language, setLanguage] = useState<string>(settings.language);

  const tabs: { id: UserSettings['tab']; label: string }[] = [
    { id: 'Profile', label: t('settings.tabProfile') },
    { id: 'Quiz defaults', label: t('settings.tabQuizDefaults') },
    { id: 'Notifications', label: t('settings.tabNotifications') },
    { id: 'Privacy & account', label: t('settings.tabPrivacy') }
  ];

  const activeTabObj = tabs.find((tab) => tab.id === settings.tab) ?? tabs[0];
  const activeTab = activeTabObj.id;
  const activeTabLabel = activeTabObj.label;

  const handleSave = () => {
    updateSettings({
      displayName: displayName.trim() || 'Alex M.',
      email: email.trim() || 'alex.m@example.com',
      defaultQuestions,
      difficulty,
      language
    });
    showToast(t('toasts.preferencesSaved'));
  };

  const handleExportData = () => {
    const blob = new Blob(
      [JSON.stringify({ quizzes, history, settings }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'QuizClash-study-data.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast(t('toasts.dataExported'));
  };

  const handleDeleteAccountPrompt = () => {
    openModal({
      title: t('modals.resetDataTitle'),
      message: t('modals.resetDataMessage'),
      confirmLabel: t('modals.resetDataConfirm'),
      onConfirm: () => {
        resetAllData();
        navigate('/dashboard');
      }
    });
  };

  return (
    <div className="settings-page-layout">
      <div className="settings-sticky-head">
        <PageHeader
          breadcrumbs={[
            { label: 'QuizClash', to: '/' },
            {
              label: t('nav.helpSettings'),
              onClick: () => updateSettings({ tab: 'Profile' })
            },
            {
              label: activeTabLabel,
              siblingRoutes: tabs.map((tab) => ({
                label: tab.label,
                active: tab.id === activeTab,
                onClick: () => updateSettings({ tab: tab.id })
              }))
            }
          ]}
          title={t('settings.title')}
          subtitle={t('settings.subtitle')}
          dataName="Settings heading"
        />

        <nav
          className="settings-top-nav"
          role="tablist"
          aria-label={t('settings.tabsAria')}
        >
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`settings-top-nav-item ${isSelected ? 'active' : ''}`}
                onClick={() => updateSettings({ tab: tab.id })}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="settings-tab-panel" role="tabpanel">
        {/* Tab 1: Profile & Appearance */}
        {activeTab === 'Profile' && (
          <>
            <SectionCard dataName="Profile">
              <h2 className="section-title" style={{ marginBottom: 4 }}>
                {t('settings.profileTitle')}
              </h2>
              <p className="helper-text" style={{ marginBottom: 16 }}>
                {t('settings.profileSubtitle')}
              </p>
              <div className="grid-2-equal">
                <div className="field-group" style={{ marginBottom: 8 }}>
                  <label className="field-label" htmlFor="settings-display-name">
                    {t('settings.displayNameLabel')}
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
                    {t('settings.emailLabel')}
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
              <p className="helper-text">{t('settings.profileHelper')}</p>
            </SectionCard>

            <SectionCard dataName="Appearance">
              <h2 className="section-title" style={{ marginBottom: 4 }}>
                {t('settings.appearanceTitle')}
              </h2>
              <p className="helper-text" style={{ marginBottom: 16 }}>
                {t('settings.appearanceSubtitle')}
              </p>
              <div className="banner-row">
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {t('settings.themeLabel')}
                  </div>
                  <div className="helper-text">{t('settings.themeHelper')}</div>
                </div>
                <div
                  className="theme-choice-group"
                  role="radiogroup"
                  aria-label={t('settings.themeAria')}
                >
                  {(
                    [
                      { value: 'light', label: t('settings.themeLight'), Icon: Sun },
                      { value: 'dark', label: t('settings.themeDark'), Icon: Moon },
                      { value: 'system', label: t('settings.themeSystem'), Icon: Monitor }
                    ] as { value: ThemeMode; label: string; Icon: typeof Sun }[]
                  ).map(({ value, label, Icon }) => {
                    const isSelected = theme === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        className={`theme-choice-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => setTheme(value)}
                      >
                        <Icon size={15} aria-hidden="true" />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </SectionCard>

            <SectionCard dataName="Language">
              <h2 className="section-title" style={{ marginBottom: 4 }}>
                {t('settings.languageTitle')}
              </h2>
              <p className="helper-text" style={{ marginBottom: 16 }}>
                {t('settings.languageSubtitle')}
              </p>
              <div className="banner-row">
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {t('settings.displayLanguageLabel')}
                  </div>
                  <div className="helper-text">
                    {t('settings.displayLanguageHelper')}
                  </div>
                </div>
                <div
                  className="theme-choice-group theme-choice-group-2"
                  role="radiogroup"
                  aria-label={t('settings.languageAria')}
                >
                  {(
                    [
                      { value: 'en', label: t('settings.langEnglish'), Flag: UkFlagIcon },
                      {
                        value: 'mm',
                        label: t('settings.langMyanmar'),
                        Flag: MyanmarFlagIcon
                      }
                    ] as { value: AppLanguage; label: string; Flag: typeof UkFlagIcon }[]
                  ).map(({ value, label, Flag }) => {
                    const isSelected = uiLanguage === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        className={`theme-choice-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => setUiLanguage(value)}
                      >
                        <Flag width={18} height={13} />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </SectionCard>
          </>
        )}

        {/* Tab 2: Quiz Defaults */}
        {activeTab === 'Quiz defaults' && (
          <SectionCard dataName="Quiz defaults">
            <h2 className="section-title" style={{ marginBottom: 4 }}>
              {t('settings.quizDefaultsTitle')}
            </h2>
            <p className="helper-text" style={{ marginBottom: 16 }}>
              {t('settings.quizDefaultsSubtitle')}
            </p>

            <div className="stat-grid-3" style={{ marginBottom: 16 }}>
              <div className="field-group" style={{ margin: 0 }}>
                <label className="field-label" htmlFor="settings-default-q">
                  {t('settings.defaultQuestionsLabel')}
                </label>
                <Select
                  value={String(defaultQuestions)}
                  onValueChange={(val) => setDefaultQuestions(Number(val))}
                >
                  <SelectTrigger id="settings-default-q" className="w-full">
                    <SelectValue placeholder={t('generate.selectQuestionCount')} />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {[5, 10, 15, 20].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {t('common.questionsCount', { count: n })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="field-group" style={{ margin: 0 }}>
                <label className="field-label" htmlFor="settings-difficulty">
                  {t('settings.difficultyLabel')}
                </label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="settings-difficulty" className="w-full">
                    <SelectValue placeholder={t('settings.selectDifficulty')} />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {[
                      { value: 'Mixed', label: t('settings.difficultyMixed') },
                      {
                        value: 'Foundational',
                        label: t('settings.difficultyFoundational')
                      },
                      { value: 'Advanced', label: t('settings.difficultyAdvanced') }
                    ].map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="field-group" style={{ margin: 0 }}>
                <label className="field-label" htmlFor="settings-language">
                  {t('settings.quizLanguageLabel')}
                </label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="settings-language" className="w-full">
                    <SelectValue placeholder={t('settings.selectLanguage')} />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {['English', 'Myanmar (မြန်မာ)', 'Japanese (日本語)', 'Spanish'].map(
                      (lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SettingToggleRow
              label={t('settings.shuffleLabel')}
              description={t('settings.shuffleDesc')}
              checked={settings.shuffleQuestions}
              onToggle={() =>
                updateSettings({ shuffleQuestions: !settings.shuffleQuestions })
              }
            />

            <SettingToggleRow
              label={t('settings.explanationsLabel')}
              description={t('settings.explanationsDesc')}
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
              {t('settings.notificationsTitle')}
            </h2>
            <p className="helper-text" style={{ marginBottom: 16 }}>
              {t('settings.notificationsSubtitle')}
            </p>

            <SettingToggleRow
              label={t('settings.studyRemindersLabel')}
              description={t('settings.studyRemindersDesc')}
              checked={settings.studyReminders}
              onToggle={() =>
                updateSettings({ studyReminders: !settings.studyReminders })
              }
            />

            <SettingToggleRow
              label={t('settings.weeklySummaryLabel')}
              description={t('settings.weeklySummaryDesc')}
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
              {t('settings.privacyTitle')}
            </h2>
            <p className="helper-text" style={{ marginBottom: 16 }}>
              {t('settings.privacySubtitle')}
            </p>
            <div className="banner-row">
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {t('settings.privateQuizzesTitle')}
                </div>
                <div className="helper-text">{t('settings.privateQuizzesDesc')}</div>
              </div>
              <div className="btn-row">
                <button type="button" className="btn btn-sm" onClick={handleExportData}>
                  {t('settings.exportDataBtn')}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={handleDeleteAccountPrompt}
                >
                  {t('settings.deleteAccountBtn')}
                </button>
              </div>
            </div>
          </SectionCard>
        )}
      </div>

      <div className="action-footer-bar" data-name="Save preferences">
        <span className="helper-text">{t('settings.footerNote')}</span>
        <div className="btn-row">
          <Link to="/dashboard" className="btn">
            {t('common.cancel')}
          </Link>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            {t('common.saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
};
