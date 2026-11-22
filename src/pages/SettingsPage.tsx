import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, LogOut, Monitor, Moon, Sun, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import * as api from '../services/api';
import type { AppLanguage, ThemeMode, UserSettings } from '../types/quiz';
import {
  MyanmarFlagIcon,
  PRESET_AVATARS,
  PageHeader,
  SectionCard,
  SettingToggleRow,
  UkFlagIcon,
  UserAvatar
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
    user,
    logout,
    refreshUser,
    startGoogleOAuth,
    unlinkGoogleOAuth,
    getErrorMessage,
    theme,
    setTheme,
    uiLanguage,
    setUiLanguage,
    settings,
    updateSettings,
    saveSettingsToBackend,
    exportAccountData,
    resetAllData,
    openModal,
    showToast,
    t
  } = useApp();

  const navigate = useNavigate();

  const [unlinkingGoogle, setUnlinkingGoogle] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState<boolean>(false);

  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string>('');
  const [changingPassword, setChangingPassword] = useState<boolean>(false);

  // Snapshot of the last backend-persisted settings so Cancel can revert live previews
  const hasLocalEditsRef = useRef<boolean>(false);
  const savedSnapshotRef = useRef<{
    theme: ThemeMode;
    uiLanguage: AppLanguage;
    avatarUrl: string | null | undefined;
    shuffleQuestions: boolean;
    showExplanations: boolean;
    studyReminders: boolean;
    weeklySummary: boolean;
  }>({
    theme,
    uiLanguage,
    avatarUrl: user?.avatar_url ?? settings.avatarUrl,
    shuffleQuestions: settings.shuffleQuestions,
    showExplanations: settings.showExplanations,
    studyReminders: settings.studyReminders,
    weeklySummary: settings.weeklySummary
  });

  useEffect(() => {
    if (!hasLocalEditsRef.current) {
      savedSnapshotRef.current = {
        theme,
        uiLanguage,
        avatarUrl: user?.avatar_url ?? settings.avatarUrl,
        shuffleQuestions: settings.shuffleQuestions,
        showExplanations: settings.showExplanations,
        studyReminders: settings.studyReminders,
        weeklySummary: settings.weeklySummary
      };
    }
  }, [
    theme,
    uiLanguage,
    user?.avatar_url,
    settings.avatarUrl,
    settings.shuffleQuestions,
    settings.showExplanations,
    settings.studyReminders,
    settings.weeklySummary
  ]);

  useEffect(() => {
    if (!avatarModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAvatarModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [avatarModalOpen]);

  const [displayNameDraft, setDisplayNameDraft] = useState<string | null>(null);
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [defaultQuestionsDraft, setDefaultQuestionsDraft] = useState<number | null>(null);
  const [difficultyDraft, setDifficultyDraft] = useState<string | null>(null);
  const [languageDraft, setLanguageDraft] = useState<string | null>(null);

  const displayName = displayNameDraft ?? settings.displayName;
  const email = emailDraft ?? settings.email;
  const defaultQuestions = defaultQuestionsDraft ?? settings.defaultQuestions;
  const difficulty = difficultyDraft ?? settings.difficulty;
  const language = languageDraft ?? settings.language;

  const setDisplayName = (v: string) => setDisplayNameDraft(v);
  const setEmail = (v: string) => setEmailDraft(v);
  const setDefaultQuestions = (v: number) => setDefaultQuestionsDraft(v);
  const setDifficulty = (v: string) => setDifficultyDraft(v);
  const setLanguage = (v: string) => setLanguageDraft(v);

  const tabs: { id: UserSettings['tab']; label: string }[] = [
    { id: 'Profile', label: t('settings.tabProfile') },
    { id: 'Quiz defaults', label: t('settings.tabQuizDefaults') },
    { id: 'Notifications', label: t('settings.tabNotifications') },
    { id: 'Privacy & account', label: t('settings.tabPrivacy') }
  ];

  const activeTabObj = tabs.find((tab) => tab.id === settings.tab) ?? tabs[0];
  const activeTab = activeTabObj.id;
  const activeTabLabel = activeTabObj.label;

  const handlePreviewTheme = (next: ThemeMode) => {
    hasLocalEditsRef.current = true;
    setTheme(next, { persist: false });
  };

  const handlePreviewLanguage = (next: AppLanguage) => {
    hasLocalEditsRef.current = true;
    setUiLanguage(next, { persist: false });
  };

  const handlePreviewSettings = (partial: Partial<UserSettings>) => {
    hasLocalEditsRef.current = true;
    updateSettings(partial, { persist: false });
  };

  const handleCancel = () => {
    if (hasLocalEditsRef.current) {
      const snap = savedSnapshotRef.current;
      setTheme(snap.theme, { persist: false });
      setUiLanguage(snap.uiLanguage, { persist: false });
      updateSettings(
        {
          avatarUrl: snap.avatarUrl,
          shuffleQuestions: snap.shuffleQuestions,
          showExplanations: snap.showExplanations,
          studyReminders: snap.studyReminders,
          weeklySummary: snap.weeklySummary
        },
        { persist: false }
      );
      hasLocalEditsRef.current = false;
    }
    setDisplayNameDraft(null);
    setEmailDraft(null);
    setDefaultQuestionsDraft(null);
    setDifficultyDraft(null);
    setLanguageDraft(null);
    navigate('/dashboard');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentAvatar = user?.avatar_url ?? settings.avatarUrl;
      await saveSettingsToBackend({
        displayName: displayName.trim(),
        avatarUrl: currentAvatar,
        theme,
        uiLanguage,
        defaultQuestions,
        difficulty,
        language,
        shuffleQuestions: settings.shuffleQuestions,
        showExplanations: settings.showExplanations,
        studyReminders: settings.studyReminders,
        weeklySummary: settings.weeklySummary
      });
      hasLocalEditsRef.current = false;
      savedSnapshotRef.current = {
        theme,
        uiLanguage,
        avatarUrl: currentAvatar,
        shuffleQuestions: settings.shuffleQuestions,
        showExplanations: settings.showExplanations,
        studyReminders: settings.studyReminders,
        weeklySummary: settings.weeklySummary
      };
      setDisplayNameDraft(null);
      setEmailDraft(null);
      setDefaultQuestionsDraft(null);
      setDifficultyDraft(null);
      setLanguageDraft(null);
      showToast(t('toasts.preferencesSaved'));
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    void exportAccountData();
  };

  const handleDeleteAccountPrompt = () => {
    openModal({
      title: t('modals.resetDataTitle'),
      message: t('modals.resetDataMessage'),
      confirmLabel: t('modals.resetDataConfirm'),
      onConfirm: () => {
        void resetAllData().then(() => navigate('/dashboard'));
      }
    });
  };

  const handleUnlinkGoogle = async () => {
    setUnlinkingGoogle(true);
    try {
      await unlinkGoogleOAuth();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setUnlinkingGoogle(false);
    }
  };

  const hasPassword = user?.has_password !== false;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (hasPassword && !currentPassword) {
      setPasswordError(t('settings.currentPasswordRequired'));
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError(t('settings.newPasswordTooShort'));
      return;
    }
    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setPasswordError(t('settings.newPasswordWeak'));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError(t('settings.passwordsMustMatch'));
      return;
    }

    setChangingPassword(true);
    try {
      await api.changePassword({
        ...(hasPassword ? { currentPassword } : {}),
        newPassword,
        language: uiLanguage
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);
      await refreshUser();
      showToast(t('toasts.passwordChanged'));
    } catch (err) {
      const msg = getErrorMessage(err);
      setPasswordError(msg);
      showToast(msg, 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const isGoogleLinked = Boolean(user?.oauth_providers?.includes('google'));

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
          actions={
            user ? (
              <button
                type="button"
                className="btn"
                onClick={() => void logout().then(() => navigate('/login'))}
                data-name="Sign out"
              >
                <LogOut size={15} aria-hidden="true" />
                <span>{t('auth.signOut')}</span>
              </button>
            ) : undefined
          }
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

            <SectionCard dataName="Avatar">
              <div className="banner-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <UserAvatar
                    avatarUrl={user?.avatar_url ?? settings.avatarUrl}
                    alt={displayName || 'Avatar'}
                    className="h-12 w-12 shrink-0 rounded-full border border-[var(--border-subtle)]"
                  />
                  <div>
                    <h2 className="section-title" style={{ marginBottom: 2 }}>
                      {t('settings.avatarTitle')}
                    </h2>
                    <p className="helper-text" style={{ margin: 0 }}>
                      {t('settings.avatarSubtitle')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setAvatarModalOpen(true)}
                >
                  {t('settings.avatarTitle')}
                </button>
              </div>
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
                        onClick={() => handlePreviewTheme(value)}
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
                        onClick={() => handlePreviewLanguage(value)}
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
                handlePreviewSettings({ shuffleQuestions: !settings.shuffleQuestions })
              }
            />

            <SettingToggleRow
              label={t('settings.explanationsLabel')}
              description={t('settings.explanationsDesc')}
              checked={settings.showExplanations}
              onToggle={() =>
                handlePreviewSettings({ showExplanations: !settings.showExplanations })
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
                handlePreviewSettings({ studyReminders: !settings.studyReminders })
              }
            />

            <SettingToggleRow
              label={t('settings.weeklySummaryLabel')}
              description={t('settings.weeklySummaryDesc')}
              checked={settings.weeklySummary}
              onToggle={() =>
                handlePreviewSettings({ weeklySummary: !settings.weeklySummary })
              }
            />
          </SectionCard>
        )}

        {/* Tab 4: Privacy & Account */}
        {activeTab === 'Privacy & account' && (
          <>
            <SectionCard dataName="Account session">
              <h2 className="section-title" style={{ marginBottom: 4 }}>
                {t('auth.accountSectionTitle')}
              </h2>
              <p className="helper-text" style={{ marginBottom: 16 }}>
                {user
                  ? t('auth.signedInAs', { email: user.email })
                  : t('auth.accountSectionDesc')}
              </p>
              <div className="btn-row">
                {user ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => void logout().then(() => navigate('/login'))}
                    >
                      {t('auth.signOut')}
                    </button>
                    {isGoogleLinked ? (
                      <button
                        type="button"
                        className="btn btn-sm"
                        disabled={unlinkingGoogle || user.has_password === false}
                        title={
                          user.has_password === false
                            ? t('auth.unlinkGoogleNeedsPassword')
                            : undefined
                        }
                        onClick={() => void handleUnlinkGoogle()}
                      >
                        {t('auth.unlinkGoogleBtn')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => startGoogleOAuth('/settings')}
                      >
                        {t('auth.connectGoogleBtn')}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-sm btn-primary">
                      {t('auth.signIn')}
                    </Link>
                    <Link to="/register" className="btn btn-sm">
                      {t('auth.signUp')}
                    </Link>
                  </>
                )}
              </div>
              {user && (
                <p className="helper-text" style={{ marginTop: 10 }}>
                  {isGoogleLinked
                    ? user.has_password === false
                      ? `${t('auth.googleLinkedStatus')} · ${t('auth.unlinkGoogleNeedsPassword')}`
                      : t('auth.googleLinkedStatus')
                    : t('auth.googleNotLinkedStatus')}
                </p>
              )}
            </SectionCard>

            {user && (
              <SectionCard dataName="Change password">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <KeyRound size={17} aria-hidden="true" />
                  <h2 className="section-title" style={{ margin: 0 }}>
                    {hasPassword
                      ? t('settings.changePasswordTitle')
                      : t('settings.setPasswordTitle')}
                  </h2>
                </div>
                <p className="helper-text" style={{ marginBottom: 16 }}>
                  {hasPassword
                    ? t('settings.changePasswordSubtitle')
                    : t('settings.setPasswordSubtitle')}
                </p>

                <form noValidate onSubmit={handleChangePassword}>
                  {hasPassword && (
                    <div className="field-group">
                      <label className="field-label" htmlFor="settings-current-password">
                        {t('settings.currentPasswordLabel')}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="settings-current-password"
                          className="input"
                          type={showCurrentPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          placeholder={t('settings.currentPasswordPlaceholder')}
                          value={currentPassword}
                          disabled={changingPassword}
                          style={{ paddingRight: 40 }}
                          onChange={(e) => {
                            setCurrentPassword(e.target.value);
                            if (passwordError) setPasswordError('');
                          }}
                        />
                        <button
                          type="button"
                          aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowCurrentPassword((prev) => !prev)}
                          style={{
                            position: 'absolute',
                            right: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            padding: 4,
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                        >
                          {showCurrentPassword ? (
                            <EyeOff size={16} aria-hidden="true" />
                          ) : (
                            <Eye size={16} aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid-2" style={{ gap: 14 }}>
                    <div className="field-group" style={{ marginBottom: 0 }}>
                      <label className="field-label" htmlFor="settings-new-password">
                        {t('settings.newPasswordLabel')}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="settings-new-password"
                          className="input"
                          type={showNewPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          minLength={8}
                          placeholder={t('settings.newPasswordPlaceholder')}
                          value={newPassword}
                          disabled={changingPassword}
                          style={{ paddingRight: 40 }}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (passwordError) setPasswordError('');
                          }}
                        />
                        <button
                          type="button"
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          style={{
                            position: 'absolute',
                            right: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            padding: 4,
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                        >
                          {showNewPassword ? (
                            <EyeOff size={16} aria-hidden="true" />
                          ) : (
                            <Eye size={16} aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="field-group" style={{ marginBottom: 0 }}>
                      <label className="field-label" htmlFor="settings-confirm-password">
                        {t('settings.confirmNewPasswordLabel')}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="settings-confirm-password"
                          className="input"
                          type={showConfirmNewPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          minLength={8}
                          placeholder={t('settings.confirmNewPasswordPlaceholder')}
                          value={confirmNewPassword}
                          disabled={changingPassword}
                          style={{ paddingRight: 40 }}
                          onChange={(e) => {
                            setConfirmNewPassword(e.target.value);
                            if (passwordError) setPasswordError('');
                          }}
                        />
                        <button
                          type="button"
                          aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                          style={{
                            position: 'absolute',
                            right: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            padding: 4,
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                        >
                          {showConfirmNewPassword ? (
                            <EyeOff size={16} aria-hidden="true" />
                          ) : (
                            <Eye size={16} aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="helper-text" style={{ marginTop: 10, marginBottom: 14 }}>
                    {t('settings.passwordHint')}
                  </p>

                  {passwordError && (
                    <p className="error-text" role="alert" style={{ marginBottom: 12 }}>
                      {passwordError}
                    </p>
                  )}

                  <div className="btn-row">
                    <button
                      type="submit"
                      className="btn btn-sm btn-primary"
                      disabled={changingPassword}
                    >
                      {changingPassword
                        ? t('auth.submitting')
                        : hasPassword
                        ? t('settings.updatePasswordBtn')
                        : t('settings.setPasswordBtn')}
                    </button>
                  </div>
                </form>
              </SectionCard>
            )}

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
          </>
        )}
      </div>

      <div className="action-footer-bar" data-name="Save preferences">
        <span className="helper-text">{t('settings.footerNote')}</span>
        <div className="btn-row">
          <button type="button" className="btn" onClick={handleCancel}>
            {t('common.cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {t('common.saveChanges')}
          </button>
        </div>
      </div>

      {/* Avatar Picker Popup Modal */}
      {avatarModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="avatar-picker-title"
          onClick={() => setAvatarModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(15, 15, 25, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div
            className="box-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(500px, 100%)',
              padding: 0,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <h2
                  id="avatar-picker-title"
                  style={{ fontSize: 17, fontWeight: 700, margin: 0 }}
                >
                  {t('settings.avatarTitle')}
                </h2>
                <p className="helper-text" style={{ margin: '2px 0 0', fontSize: 12.5 }}>
                  {t('settings.avatarSubtitle')}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                aria-label={t('review.closePreview')}
                onClick={() => setAvatarModalOpen(false)}
                style={{ padding: '6px 8px' }}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: 12,
                padding: 20
              }}
              role="radiogroup"
              aria-label={t('settings.avatarTitle')}
            >
              {PRESET_AVATARS.map((item) => {
                const selectedAvatar = user?.avatar_url ?? settings.avatarUrl;
                const isSelected = selectedAvatar === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      handlePreviewSettings({ avatarUrl: item.id });
                      setAvatarModalOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 7,
                      padding: '12px 8px',
                      borderRadius: 12,
                      border: isSelected
                        ? '2px solid var(--primary)'
                        : '1px solid var(--border-subtle)',
                      background: isSelected ? 'var(--bg-subtle)' : 'var(--bg-elevated)',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, background 0.15s'
                    }}
                  >
                    <span
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: '999px',
                        overflow: 'hidden',
                        display: 'inline-flex'
                      }}
                    >
                      {item.svg}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: isSelected ? 700 : 500,
                        color: 'var(--text-main)'
                      }}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
