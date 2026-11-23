import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MailCheck,
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ThemeSwitch } from '../components/common';
import * as api from '../services/api';

export type AuthMode = 'login' | 'register' | 'verify' | 'forgot' | 'reset';

interface AuthPageProps {
  mode: AuthMode;
}

const OTP_LENGTH = 6;

const GoogleIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

export const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const { login, startGoogleOAuth, register, uiLanguage, getErrorMessage, showToast, t } =
    useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ||
    '/dashboard';

  const queryEmail = searchParams.get('email')?.trim() || '';
  const queryToken = searchParams.get('token') || '';

  const [motionEnabled, setMotionEnabled] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(queryEmail);
  const [prevQueryEmail, setPrevQueryEmail] = useState<string>(queryEmail);
  if (queryEmail !== prevQueryEmail) {
    setPrevQueryEmail(queryEmail);
    if (queryEmail) setEmail(queryEmail);
  }
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [registerPasswordFocused, setRegisterPasswordFocused] = useState<boolean>(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState<boolean>(false);
  const [previewExpanded, setPreviewExpanded] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>('');
  const [token, setToken] = useState<string>(
    mode === 'verify' ? queryToken.replace(/\D/g, '').slice(0, OTP_LENGTH) : queryToken
  );
  const [otpSelection, setOtpSelection] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0
  });
  const otpInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [googleSubmitting, setGoogleSubmitting] = useState<boolean>(false);

  const getOAuthErrorMessage = (code: string): string => {
    const messageMap: Record<string, string> = {
      OAUTH_PROVIDER_DISABLED: t('auth.googleBackendPending'),
      OAUTH_CANCELLED: t('auth.oauthCancelled'),
      OAUTH_INVALID_STATE: t('auth.oauthInvalidState'),
      OAUTH_EMAIL_NOT_VERIFIED: t('auth.oauthEmailNotVerified'),
      OAUTH_ACCOUNT_ALREADY_EXISTS: t('auth.oauthAccountAlreadyExists'),
      ACCOUNT_ALREADY_EXISTS: t('auth.oauthAccountAlreadyExists'),
      EMAIL_ALREADY_REGISTERED: t('auth.oauthAccountAlreadyExists'),
      ACCOUNT_DISABLED: t('auth.oauthAccountDisabled')
    };
    return messageMap[code] || t('auth.oauthFailed');
  };

  const initialOAuthError = searchParams.get('oauth_error');
  const [oauthProviders, setOauthProviders] = useState<string[] | null>(null);
  const [error, setError] = useState<string>(() =>
    initialOAuthError ? getOAuthErrorMessage(initialOAuthError) : ''
  );
  const [errorCode, setErrorCode] = useState<string | undefined>(
    initialOAuthError || undefined
  );
  const [infoMessage, setInfoMessage] = useState<string>('');

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
  }>({});

  useEffect(() => {
    document.title =
      mode === 'register'
        ? 'Sign up · QuizClash'
        : mode === 'verify'
        ? 'Verify email · QuizClash'
        : mode === 'forgot'
        ? 'Forgot password · QuizClash'
        : mode === 'reset'
        ? 'Reset password · QuizClash'
        : 'Sign in · QuizClash';
  }, [mode]);

  useEffect(() => {
    if (mode !== 'login' && mode !== 'register') return;
    let active = true;
    void api
      .getOAuthProviders(uiLanguage)
      .then((res) => {
        if (active) setOauthProviders(res.providers || []);
      })
      .catch(() => {
        if (active) setOauthProviders(null);
      });
    return () => {
      active = false;
    };
  }, [mode, uiLanguage]);

  useEffect(() => {
    const oauthErr = searchParams.get('oauth_error');
    if (!oauthErr) return;

    showToast(getOAuthErrorMessage(oauthErr), 'error');

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('oauth_error');
    setSearchParams(nextParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, setSearchParams, showToast]);

  const handleModeSwitchClick = () => {
    setMotionEnabled(true);
    setError('');
    setErrorCode(undefined);
    setInfoMessage('');
    setFieldErrors({});
    setRegisterPasswordFocused(false);
    setConfirmPasswordFocused(false);
  };

  const handleGoogleAuth = async (oauthMode: api.GoogleOAuthMode) => {
    setError('');
    setErrorCode(undefined);
    setInfoMessage('');
    setGoogleSubmitting(true);

    try {
      let providers = oauthProviders;
      if (providers === null) {
        try {
          const res = await api.getOAuthProviders(uiLanguage);
          providers = res.providers || [];
          setOauthProviders(providers);
        } catch {
          // Proceed with direct redirect if provider check fails
        }
      }

      if (providers !== null && !providers.includes('google')) {
        const msg = t('auth.googleBackendPending');
        setInfoMessage(msg);
        showToast(msg, 'info');
        setGoogleSubmitting(false);
        return;
      }

      startGoogleOAuth(redirectTo, oauthMode);
    } catch (err) {
      setError(getErrorMessage(err));
      setGoogleSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorCode(undefined);
    setInfoMessage('');

    const nextErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      nextErrors.email = t('auth.errEmailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = t('auth.errEmailInvalid');
    }
    if (!password) {
      nextErrors.password = t('auth.errPasswordRequired');
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      if (err instanceof api.ApiError) {
        setErrorCode(err.code);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const passwordChecks = [
    {
      key: 'length',
      met: password.length >= 8,
      label: t('auth.passwordReqLength'),
      errorMessage: t('auth.errPasswordTooShort')
    },
    {
      key: 'upper',
      met: /[A-Z]/.test(password),
      label: t('auth.passwordReqUpper'),
      errorMessage: t('auth.errPasswordUpper')
    },
    {
      key: 'lower',
      met: /[a-z]/.test(password),
      label: t('auth.passwordReqLower'),
      errorMessage: t('auth.errPasswordLower')
    },
    {
      key: 'number',
      met: /\d/.test(password),
      label: t('auth.passwordReqNumber'),
      errorMessage: t('auth.errPasswordNumber')
    }
  ];
  const metPasswordCount = passwordChecks.filter((rule) => rule.met).length;
  const allPasswordRulesMet = metPasswordCount === passwordChecks.length;
  const showPasswordPreview =
    mode === 'register' &&
    (registerPasswordFocused || (Boolean(fieldErrors.password) && !allPasswordRulesMet));

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorCode(undefined);
    setInfoMessage('');

    const nextErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirm?: string;
    } = {};

    if (!displayName.trim()) {
      nextErrors.name = t('auth.errNameRequired');
    }
    if (!email.trim()) {
      nextErrors.email = t('auth.errEmailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = t('auth.errEmailInvalid');
    }
    if (!password) {
      nextErrors.password = t('auth.errPasswordRequired');
    } else {
      const unmetRule = passwordChecks.find((rule) => !rule.met);
      if (unmetRule) {
        nextErrors.password = unmetRule.errorMessage;
      }
    }
    if (!confirmPassword) {
      nextErrors.confirm = t('auth.errConfirmRequired');
    } else if (confirmPassword !== password) {
      nextErrors.confirm = t('auth.errPasswordsMismatch');
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await register(email.trim(), password, displayName.trim());
      navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(getErrorMessage(err));
      if (err instanceof api.ApiError) {
        setErrorCode(err.code);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const syncOtpSelection = () => {
    const el = otpInputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;
    setOtpSelection({ start, end });
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const rawCaret = e.target.selectionStart ?? raw.length;
    const nextCode = raw.replace(/\D/g, '').slice(0, OTP_LENGTH);
    const nextCaret = raw.slice(0, rawCaret).replace(/\D/g, '').slice(0, OTP_LENGTH).length;
    setToken(nextCode);
    setOtpSelection({ start: nextCaret, end: nextCaret });
    if (error) setError('');
    requestAnimationFrame(() => {
      if (otpInputRef.current) {
        otpInputRef.current.setSelectionRange(nextCaret, nextCaret);
      }
    });
  };

  const handleOtpClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const el = otpInputRef.current;
    if (!el || e.detail !== 1 || el.selectionStart !== el.selectionEnd) {
      syncOtpSelection();
      return;
    }
    const { left, width } = el.getBoundingClientRect();
    const index = Math.floor((e.clientX - left) / (width / OTP_LENGTH));
    const caret = Math.max(0, Math.min(index, token.length));
    el.setSelectionRange(caret, caret);
    setOtpSelection({ start: caret, end: caret });
  };

  const handleAuxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorCode(undefined);
    setInfoMessage('');

    if (mode === 'verify') {
      const cleaned = token.replace(/\D/g, '');
      if (cleaned.length !== OTP_LENGTH) {
        setError(t('auth.verifyIncomplete'));
        otpInputRef.current?.focus();
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === 'verify') {
        await api.verifyEmail(token.trim(), uiLanguage, email.trim() || undefined);
        showToast(t('toasts.emailVerified'));
        navigate('/login');
      } else if (mode === 'forgot') {
        await api.forgotPassword(email.trim(), uiLanguage);
        showToast(t('toasts.passwordResetSent'), 'info');
        setInfoMessage(t('toasts.passwordResetSent'));
        navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`);
      } else if (mode === 'reset') {
        await api.resetPassword(token.trim(), password, uiLanguage);
        showToast(t('toasts.passwordResetDone'));
        navigate('/login');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setError(t('auth.errEmailRequired'));
      return;
    }
    setError('');
    setInfoMessage('');
    setSubmitting(true);
    try {
      await api.resendVerification(email.trim(), uiLanguage);
      showToast(t('toasts.verificationResent'), 'info');
      setInfoMessage(t('toasts.verificationResent'));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const isLoginOrRegister = mode === 'login' || mode === 'register';
  const layoutMode = isLoginOrRegister ? mode : 'aux';
  const activeFieldErrors = Object.values(fieldErrors).filter(Boolean) as string[];
  const showErrorPreview =
    isLoginOrRegister &&
    !showPasswordPreview &&
    (Boolean(error) || activeFieldErrors.length > 0);

  const renderErrorCardBody = () => (
    <div className="auth-error-preview" role="alert" aria-live="polite">
      <p className="preview-meta auth-error-meta">
        <span className="auth-error-badge">
          <AlertCircle size={14} strokeWidth={2} aria-hidden="true" />
          <span>
            {mode === 'register'
              ? uiLanguage === 'mm'
                ? t('auth.signUp')
                : 'Sign-up issue'
              : uiLanguage === 'mm'
              ? t('auth.signIn')
              : 'Sign-in issue'}
          </span>
        </span>
      </p>
      <p className="preview-title auth-error-title">
        {error || activeFieldErrors[0]}
      </p>
      {(error ? activeFieldErrors.length > 0 : activeFieldErrors.length > 1) && (
        <ul className="auth-error-list" role="list">
          {(error ? activeFieldErrors : activeFieldErrors.slice(1)).map((msg) => (
            <li key={msg}>
              <span className="auth-error-dot" aria-hidden="true" />
              <span>{msg}</span>
            </li>
          ))}
        </ul>
      )}
      {mode === 'login' && errorCode === 'EMAIL_NOT_VERIFIED' && (
        <div className="auth-error-action">
          <Link
            to={`/verify-email${
              email.trim() ? `?email=${encodeURIComponent(email.trim())}` : ''
            }`}
          >
            {t('auth.verifyBtn')}
          </Link>
        </div>
      )}
      {mode === 'login' && error && errorCode !== 'EMAIL_NOT_VERIFIED' && (
        <div className="auth-error-action">
          <Link to="/forgot-password" onClick={handleModeSwitchClick}>
            {t('auth.forgotPasswordLink')}
          </Link>
        </div>
      )}
      {mode === 'register' &&
        (errorCode === 'OAUTH_ACCOUNT_ALREADY_EXISTS' ||
          errorCode === 'ACCOUNT_ALREADY_EXISTS' ||
          errorCode === 'EMAIL_ALREADY_REGISTERED') && (
          <div className="auth-error-action">
            <Link to="/login" onClick={handleModeSwitchClick}>
              {t('auth.signIn')} →
            </Link>
          </div>
        )}
    </div>
  );

  return (
    <div
      className="qc-auth-page"
      data-auth-mode={layoutMode}
      {...(motionEnabled ? { 'data-auth-motion': '' } : {})}
      {...(showPasswordPreview ? { 'data-password-preview': '' } : {})}
      {...(showErrorPreview ? { 'data-error-preview': '' } : {})}
    >
      <header className="site-header">
        <div className="header-content">
          <Link className="brand" to="/">
            <span className="brand-mark" aria-hidden="true"></span>
            <span>QuizClash</span>
          </Link>

          <div className="header-right-actions">
            <ThemeSwitch variant="header" />
            <nav
              className={`account-switch${mode === 'verify' ? ' is-disabled' : ''}`}
              aria-label={t('auth.eyebrow')}
            >
              {mode === 'verify' ? (
                <>
                  <span aria-disabled="true">{t('auth.signIn')}</span>
                  <span aria-disabled="true">
                    {uiLanguage === 'mm' ? t('auth.signUp') : 'Sign up'}
                  </span>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    aria-current={mode === 'login' ? 'page' : undefined}
                    onClick={handleModeSwitchClick}
                  >
                    {t('auth.signIn')}
                  </Link>
                  <Link
                    to="/register"
                    aria-current={mode === 'register' ? 'page' : undefined}
                    onClick={handleModeSwitchClick}
                  >
                    {uiLanguage === 'mm' ? t('auth.signUp') : 'Sign up'}
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {isLoginOrRegister ? (
        <main className="auth-layout">
          <div className="auth">
            {/* LOGIN VIEW */}
            <section
              data-view="login"
              aria-labelledby="login-heading"
              inert={mode !== 'login' ? true : undefined}
            >
              <h1 id="login-heading" tabIndex={-1}>
                {uiLanguage === 'mm' ? t('auth.loginTitle') : 'Welcome back.'}
              </h1>
              <p className="intro">
                {uiLanguage === 'mm'
                  ? t('auth.loginSubtitle')
                  : 'Get back to your quizzes, scores, and live games.'}
              </p>

              <button
                type="button"
                className="google-button"
                onClick={() => void handleGoogleAuth('login')}
                disabled={submitting || googleSubmitting}
                data-name="Google login button"
              >
                {googleSubmitting ? (
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                ) : (
                  <GoogleIcon />
                )}
                <span>{t('auth.googleSignIn')}</span>
              </button>

              <div className="auth-divider" role="separator">
                <span>{t('auth.orContinueWith')}</span>
              </div>

              <form method="post" noValidate onSubmit={handleLoginSubmit}>
                <fieldset
                  className="form-fields"
                  aria-label="Sign-in details"
                  disabled={submitting}
                >
                  <div className="field">
                    <label htmlFor="login-email">{t('auth.emailLabel')}</label>
                    <div className="field-control">
                      <span className="field-icon" aria-hidden="true">
                        <Mail size={17} strokeWidth={1.7} />
                      </span>
                      <input
                        id="login-email"
                        name="email"
                        type="email"
                        autoComplete="username"
                        placeholder={t('auth.emailPlaceholder')}
                        required
                        value={email}
                        aria-invalid={fieldErrors.email ? 'true' : undefined}
                        aria-describedby="login-email-error"
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) {
                            setError('');
                            setErrorCode(undefined);
                          }
                          if (fieldErrors.email) {
                            setFieldErrors((prev) => ({ ...prev, email: undefined }));
                          }
                        }}
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="field-error" id="login-email-error">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="field">
                    <div className="field-label-row">
                      <label htmlFor="login-password">{t('auth.passwordLabel')}</label>
                      <Link
                        to="/forgot-password"
                        className="forgot-link"
                        onClick={handleModeSwitchClick}
                      >
                        {t('auth.forgotPasswordLink')}
                      </Link>
                    </div>
                    <div className="field-control password-field">
                      <span className="field-icon" aria-hidden="true">
                        <Lock size={17} strokeWidth={1.7} />
                      </span>
                      <input
                        id="login-password"
                        name="password"
                        type={showLoginPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={password}
                        aria-invalid={fieldErrors.password ? 'true' : undefined}
                        aria-describedby="login-password-error"
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) {
                            setError('');
                            setErrorCode(undefined);
                          }
                          if (fieldErrors.password) {
                            setFieldErrors((prev) => ({ ...prev, password: undefined }));
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        aria-controls="login-password"
                        aria-label={
                          showLoginPassword ? t('common.hidePassword') : t('common.showPassword')
                        }
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                      >
                        {showLoginPassword ? (
                          <EyeOff size={18} aria-hidden="true" />
                        ) : (
                          <Eye size={18} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="field-error" id="login-password-error">
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>

                  <button className="submit-button" type="submit" disabled={submitting}>
                    <span>{submitting ? t('auth.submitting') : t('auth.signIn')}</span>
                    {!submitting && (
                      <span className="submit-arrow" aria-hidden="true">
                        →
                      </span>
                    )}
                  </button>
                </fieldset>

                {mode === 'login' && error && (
                  <div className="form-status is-error" role="alert">
                    <div>{error}</div>
                    {errorCode === 'EMAIL_NOT_VERIFIED' && (
                      <div style={{ marginTop: 6 }}>
                        <Link
                          to={`/verify-email${
                            email.trim()
                              ? `?email=${encodeURIComponent(email.trim())}`
                              : ''
                          }`}
                          style={{ color: 'inherit', fontWeight: 700 }}
                        >
                          {t('auth.verifyBtn')}
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {mode === 'login' && infoMessage && (
                  <p className="form-status" role="status">
                    {infoMessage}
                  </p>
                )}
              </form>

              <p className="view-switch">
                {uiLanguage === 'mm' ? t('auth.noAccountPrompt') : 'New to QuizClash?'}{' '}
                <Link to="/register" onClick={handleModeSwitchClick}>
                  {uiLanguage === 'mm' ? t('auth.signUp') : 'Create an account'}
                </Link>
              </p>
            </section>

            {/* REGISTER VIEW */}
            <section
              data-view="register"
              aria-labelledby="register-heading"
              inert={mode !== 'register' ? true : undefined}
            >
              <h1 id="register-heading" tabIndex={-1}>
                {uiLanguage === 'mm' ? t('auth.registerTitle') : 'Create your account.'}
              </h1>
              <p className="intro">
                {uiLanguage === 'mm'
                  ? t('auth.registerSubtitle')
                  : 'Turn your notes into quizzes and practice with friends.'}
              </p>

              <button
                type="button"
                className="google-button"
                onClick={() => void handleGoogleAuth('register')}
                disabled={submitting || googleSubmitting}
                data-name="Google signup button"
              >
                {googleSubmitting ? (
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                ) : (
                  <GoogleIcon />
                )}
                <span>{t('auth.googleSignUp')}</span>
              </button>

              <div className="auth-divider" role="separator">
                <span>{t('auth.orContinueWith')}</span>
              </div>

              <form method="post" noValidate onSubmit={handleRegisterSubmit}>
                <fieldset
                  className="form-fields"
                  aria-label="Registration details"
                  disabled={submitting}
                >
                  <div className="field">
                    <label htmlFor="register-name">
                      {uiLanguage === 'mm' ? t('auth.displayNameLabel') : 'Full name'}
                    </label>
                    <div className="field-control">
                      <span className="field-icon" aria-hidden="true">
                        <User size={17} strokeWidth={1.7} />
                      </span>
                      <input
                        id="register-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder={t('auth.displayNamePlaceholder')}
                        required
                        value={displayName}
                        aria-invalid={fieldErrors.name ? 'true' : undefined}
                        aria-describedby="register-name-error"
                        onChange={(e) => {
                          setDisplayName(e.target.value);
                          if (fieldErrors.name) {
                            setFieldErrors((prev) => ({ ...prev, name: undefined }));
                          }
                        }}
                      />
                    </div>
                    {fieldErrors.name && (
                      <p className="field-error" id="register-name-error">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="register-email">{t('auth.emailLabel')}</label>
                    <div className="field-control">
                      <span className="field-icon" aria-hidden="true">
                        <Mail size={17} strokeWidth={1.7} />
                      </span>
                      <input
                        id="register-email"
                        name="email"
                        type="email"
                        autoComplete="username"
                        placeholder={t('auth.emailPlaceholder')}
                        required
                        value={email}
                        aria-invalid={fieldErrors.email ? 'true' : undefined}
                        aria-describedby="register-email-error"
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) {
                            setError('');
                            setErrorCode(undefined);
                          }
                          if (fieldErrors.email) {
                            setFieldErrors((prev) => ({ ...prev, email: undefined }));
                          }
                        }}
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="field-error" id="register-email-error">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="password-group">
                    <div className="field">
                      <label htmlFor="register-password">{t('auth.passwordLabel')}</label>
                      <div className="field-control password-field">
                        <span className="field-icon" aria-hidden="true">
                          <Lock size={17} strokeWidth={1.7} />
                        </span>
                        <input
                          id="register-password"
                          name="password"
                          type={showRegisterPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          minLength={8}
                          placeholder={t('auth.passwordMinPlaceholder')}
                          required
                          value={password}
                          aria-invalid={fieldErrors.password ? 'true' : undefined}
                          aria-describedby="register-password-rules register-password-error"
                          onFocus={() => {
                            setRegisterPasswordFocused(true);
                            if (window.matchMedia('(max-width: 800px)').matches) {
                              setPreviewExpanded(true);
                            }
                          }}
                          onBlur={() => setRegisterPasswordFocused(false)}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (fieldErrors.password) {
                              setFieldErrors((prev) => ({ ...prev, password: undefined }));
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          aria-controls="register-password"
                          aria-label={
                            showRegisterPassword
                              ? t('common.hidePassword')
                              : t('common.showPassword')
                          }
                          onClick={() => setShowRegisterPassword((prev) => !prev)}
                        >
                          {showRegisterPassword ? (
                            <EyeOff size={18} aria-hidden="true" />
                          ) : (
                            <Eye size={18} aria-hidden="true" />
                          )}
                        </button>
                      </div>
                      {fieldErrors.password && (
                        <p className="field-error" id="register-password-error">
                          {fieldErrors.password}
                        </p>
                      )}
                    </div>

                    <div className="field">
                      <label htmlFor="register-confirm">{t('auth.confirmPasswordLabel')}</label>
                      <div className="field-control password-field">
                        <span className="field-icon" aria-hidden="true">
                          <Lock size={17} strokeWidth={1.7} />
                        </span>
                        <input
                          id="register-confirm"
                          name="passwordConfirmation"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder={t('auth.confirmPasswordPlaceholder')}
                          required
                          value={confirmPassword}
                          aria-invalid={
                            fieldErrors.confirm ||
                            (confirmPassword.length > 0 && confirmPassword !== password)
                              ? 'true'
                              : undefined
                          }
                          aria-describedby="register-confirm-error register-confirm-status"
                          onFocus={() => setConfirmPasswordFocused(true)}
                          onBlur={() => setConfirmPasswordFocused(false)}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (fieldErrors.confirm) {
                              setFieldErrors((prev) => ({ ...prev, confirm: undefined }));
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          aria-controls="register-confirm"
                          aria-label={
                            showConfirmPassword
                              ? t('common.hidePassword')
                              : t('common.showPassword')
                          }
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} aria-hidden="true" />
                          ) : (
                            <Eye size={18} aria-hidden="true" />
                          )}
                        </button>
                      </div>
                      {fieldErrors.confirm ? (
                        <p className="field-error" id="register-confirm-error">
                          {fieldErrors.confirm}
                        </p>
                      ) : confirmPassword.length > 0 ? (
                        <p
                          className={`confirm-status ${
                            confirmPassword === password ? 'is-match' : 'is-mismatch'
                          }`}
                          id="register-confirm-status"
                          aria-live="polite"
                        >
                          {confirmPassword === password ? (
                            <CheckCircle2 size={14} aria-hidden="true" />
                          ) : (
                            <AlertCircle size={14} aria-hidden="true" />
                          )}
                          <span>
                            {confirmPassword === password
                              ? t('auth.passwordsMatch')
                              : t('auth.errPasswordsMismatch')}
                          </span>
                        </p>
                      ) : confirmPasswordFocused ? (
                        <p className="confirm-status" id="register-confirm-status" aria-live="polite">
                          <span>{t('auth.confirmPasswordHint')}</span>
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <button className="submit-button" type="submit" disabled={submitting}>
                    <span>{submitting ? t('auth.submitting') : t('auth.signUp')}</span>
                    {!submitting && (
                      <span className="submit-arrow" aria-hidden="true">
                        →
                      </span>
                    )}
                  </button>
                </fieldset>

                {mode === 'register' && error && (
                  <div className="form-status is-error" role="alert">
                    <div>{error}</div>
                    {(errorCode === 'OAUTH_ACCOUNT_ALREADY_EXISTS' ||
                      errorCode === 'ACCOUNT_ALREADY_EXISTS' ||
                      errorCode === 'EMAIL_ALREADY_REGISTERED') && (
                      <div style={{ marginTop: 6 }}>
                        <Link
                          to="/login"
                          onClick={handleModeSwitchClick}
                          style={{ color: 'inherit', fontWeight: 700 }}
                        >
                          {t('auth.signIn')}
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {mode === 'register' && infoMessage && (
                  <p className="form-status" role="status">
                    {infoMessage}
                  </p>
                )}
              </form>

              <p className="view-switch">
                {t('auth.haveAccountPrompt')}{' '}
                <Link to="/login" onClick={handleModeSwitchClick}>
                  {t('auth.signIn')}
                </Link>
              </p>
            </section>
          </div>

          <button
            className="preview-toggle"
            type="button"
            aria-controls="study-preview"
            aria-expanded={previewExpanded}
            onClick={() => setPreviewExpanded((prev) => !prev)}
          >
            <span>
              {showPasswordPreview ? t('auth.passwordProgressLabel') : t('auth.previewLabel')}
            </span>
            <span className="preview-chevron" aria-hidden="true"></span>
          </button>

          <figure
            className="study-scene"
            id="study-preview"
            aria-label="QuizClash preview: practice quiz and attempt history"
          >
            <div className="card-stack">
              <div className="stack-backdrop" aria-hidden="true"></div>
              <div className="preview-card history-card">
                <div className="attempt-preview">
                  <p className="preview-meta">{t('nav.attemptHistory')}</p>
                  <p className="preview-title">{t('results.scoreTrendTitle')}</p>
                  <svg
                    className="score-chart"
                    viewBox="0 0 300 150"
                    width="300"
                    height="150"
                    role="img"
                    aria-labelledby="attempt-chart-title"
                    aria-describedby="attempt-chart-description"
                  >
                    <title id="attempt-chart-title">
                      Sample quiz scores over three attempts
                    </title>
                    <desc id="attempt-chart-description">
                      November 16: 50%. November 17: 60%. Today: 80%.
                    </desc>
                    <defs>
                      <linearGradient id="attempt-score-fill" x2="0%" y2="100%">
                        <stop offset="5%" stopColor="currentColor" stopOpacity="0.32" />
                        <stop offset="95%" stopColor="currentColor" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M35 10H271 M35 39H271 M35 68H271 M35 97H271 M35 126H271"
                      fill="none"
                      stroke="var(--line)"
                      strokeDasharray="3 3"
                    />
                    <path
                      d="M35 68 C74.33 65.1 113.67 62.2 153 56.4 S231.67 41.9 271 33.2 V126H35Z"
                      fill="url(#attempt-score-fill)"
                    />
                    <path
                      d="M35 68 C74.33 65.1 113.67 62.2 153 56.4 S231.67 41.9 271 33.2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                    <g textAnchor="end" dominantBaseline="middle">
                      <text x="29" y="10">
                        100%
                      </text>
                      <text x="29" y="39">
                        75%
                      </text>
                      <text x="29" y="68">
                        50%
                      </text>
                      <text x="29" y="97">
                        25%
                      </text>
                      <text x="29" y="126">
                        0%
                      </text>
                    </g>
                    <g textAnchor="middle">
                      <text x="35" y="144">
                        Nov 16
                      </text>
                      <text x="153" y="144">
                        Nov 17
                      </text>
                      <text x="271" y="144">
                        Today
                      </text>
                    </g>
                  </svg>
                </div>

                <div className="registration-progress">
                  <p className="preview-meta">{t('auth.passwordReqTitle')}</p>
                  <p
                    className="preview-title"
                    id="requirement-count"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {t('auth.passwordReqCount', {
                      met: metPasswordCount,
                      total: passwordChecks.length
                    })}
                  </p>
                  <div
                    className="requirement-meter"
                    id="requirement-meter"
                    aria-hidden="true"
                    data-complete={allPasswordRulesMet ? '' : undefined}
                  >
                    {passwordChecks.map((rule, idx) => (
                      <span
                        key={rule.key}
                        data-filled={idx < metPasswordCount ? '' : undefined}
                      />
                    ))}
                  </div>
                  <ul
                    className="password-rules"
                    id="register-password-rules"
                    aria-label={t('auth.passwordReqTitle')}
                    role="list"
                  >
                    {passwordChecks.map((rule) => (
                      <li key={rule.key} data-met={rule.met ? '' : undefined}>
                        <span className="rule-indicator" aria-hidden="true"></span>
                        <span>
                          {rule.label}
                          <span className="visually-hidden">
                            {rule.met ? ' (met)' : ' (not met)'}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {renderErrorCardBody()}
              </div>

              <div className="preview-card quiz-card">
                <div className="quiz-preview">
                  <p className="preview-meta">
                    <span>Practice quiz</span>
                    <span>2 / 5</span>
                  </p>
                  <div className="quiz-progress" aria-hidden="true"></div>
                  <p className="preview-title">What is the name of this Website?</p>
                  <ul className="options" role="list">
                    <li>
                      <span className="option-letter" aria-hidden="true">
                        A
                      </span>{' '}
                      QuizGenerator
                    </li>
                    <li className="answer">
                      <span className="option-letter" aria-hidden="true">
                        B
                      </span>{' '}
                      QuizClash
                      <span className="answer-check" aria-hidden="true">
                        ✓
                      </span>
                      <span className="visually-hidden">Correct answer</span>
                    </li>
                    <li>
                      <span className="option-letter" aria-hidden="true">
                        C
                      </span>{' '}
                      AutoQuiz
                    </li>
                  </ul>
                </div>

                {renderErrorCardBody()}
              </div>
            </div>
          </figure>
        </main>
      ) : (
        /* VERIFY EMAIL / FORGOT PASSWORD / RESET PASSWORD CENTERED PANEL */
        <main className="verify-layout">
          <section className="verify-panel" aria-labelledby="verify-heading">
            <header className="verify-heading">
              <span className="verify-icon" aria-hidden="true">
                {mode === 'verify' ? (
                  <MailCheck size={27} strokeWidth={1.8} />
                ) : (
                  <KeyRound size={26} strokeWidth={1.8} />
                )}
              </span>
              <h1 id="verify-heading" tabIndex={-1}>
                {mode === 'verify'
                  ? t('auth.verifyTitle')
                  : mode === 'forgot'
                  ? t('auth.forgotTitle')
                  : t('auth.resetTitle')}
              </h1>
              {mode === 'verify' ? (
                <p className="intro">
                  <span>{t('auth.verifySentTo')}</span>
                  {email.trim() && (
                    <strong className="verify-recipient" dir="ltr">
                      {email.trim()}
                    </strong>
                  )}
                </p>
              ) : (
                <p className="intro">
                  {mode === 'forgot' ? t('auth.forgotSubtitle') : t('auth.resetSubtitle')}
                </p>
              )}
            </header>

            <form method="post" noValidate onSubmit={handleAuxSubmit}>
              <fieldset className="form-fields" disabled={submitting}>
                {(mode === 'forgot' || (mode === 'verify' && !queryEmail)) && (
                  <div className="field">
                    <label htmlFor="aux-email">{t('auth.emailLabel')}</label>
                    <div className="field-control">
                      <span className="field-icon" aria-hidden="true">
                        <Mail size={17} strokeWidth={1.7} />
                      </span>
                      <input
                        id="aux-email"
                        name="email"
                        type="email"
                        autoComplete="username"
                        placeholder={t('auth.emailPlaceholder')}
                        required={mode === 'forgot'}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {mode === 'verify' && (
                  <div className="field">
                    <label htmlFor="verify-code">{t('auth.verifyCodeLabel')}</label>
                    <div className="verify-code">
                      <div className="verify-code-slots" aria-hidden="true">
                        {Array.from({ length: OTP_LENGTH }, (_, idx) => {
                          const digit = token[idx];
                          const activeIndex = Math.min(otpSelection.start, OTP_LENGTH - 1);
                          const isSelected =
                            idx >= otpSelection.start && idx < otpSelection.end;
                          return (
                            <span
                              key={idx}
                              className="verify-code-slot"
                              data-filled={digit !== undefined ? '' : undefined}
                              data-active={idx === activeIndex ? '' : undefined}
                              data-selected={isSelected ? '' : undefined}
                            >
                              {digit !== undefined ? (
                                digit
                              ) : (
                                <span className="verify-code-dash"></span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                      <input
                        ref={otpInputRef}
                        id="verify-code"
                        name="token"
                        type="text"
                        dir="ltr"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        spellCheck={false}
                        aria-required="true"
                        aria-invalid={error ? 'true' : undefined}
                        aria-describedby={error ? 'verify-feedback' : undefined}
                        value={token}
                        onChange={handleOtpChange}
                        onFocus={syncOtpSelection}
                        onSelect={syncOtpSelection}
                        onKeyUp={syncOtpSelection}
                        onClick={handleOtpClick}
                      />
                    </div>
                  </div>
                )}

                {mode === 'reset' && (
                  <>
                    <div className="field">
                      <label htmlFor="aux-token">{t('auth.tokenLabel')}</label>
                      <div className="field-control">
                        <span className="field-icon" aria-hidden="true">
                          <KeyRound size={17} strokeWidth={1.7} />
                        </span>
                        <input
                          id="aux-token"
                          name="token"
                          type="text"
                          placeholder={t('auth.tokenPlaceholder')}
                          required
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="field">
                      <label htmlFor="aux-password">{t('auth.newPasswordLabel')}</label>
                      <div className="field-control password-field">
                        <span className="field-icon" aria-hidden="true">
                          <Lock size={17} strokeWidth={1.7} />
                        </span>
                        <input
                          id="aux-password"
                          name="password"
                          type={showLoginPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          minLength={8}
                          placeholder={t('auth.newPasswordPlaceholder')}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          aria-controls="aux-password"
                          aria-label={
                            showLoginPassword ? t('common.hidePassword') : t('common.showPassword')
                          }
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                        >
                          {showLoginPassword ? (
                            <EyeOff size={18} aria-hidden="true" />
                          ) : (
                            <Eye size={18} aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <button className="submit-button verify-submit" type="submit" disabled={submitting}>
                  <span>
                    {submitting
                      ? t('auth.submitting')
                      : mode === 'verify'
                      ? t('auth.verifyBtn').replace(/\s*→$/, '')
                      : mode === 'forgot'
                      ? t('auth.forgotBtn').replace(/\s*→$/, '')
                      : t('auth.resetBtn').replace(/\s*→$/, '')}
                  </span>
                  {!submitting && <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />}
                </button>
              </fieldset>

              {error && (
                <p
                  className="verify-feedback"
                  id="verify-feedback"
                  data-feedback="error"
                  role="alert"
                >
                  <AlertCircle size={17} strokeWidth={2} aria-hidden="true" />
                  <span>{error}</span>
                </p>
              )}

              {infoMessage && !error && (
                <p
                  className="verify-feedback"
                  id="verify-feedback"
                  data-feedback="success"
                  role="status"
                >
                  <CheckCircle2 size={17} strokeWidth={2} aria-hidden="true" />
                  <span>{infoMessage}</span>
                </p>
              )}

              {mode === 'verify' && (
                <div className="verify-resend">
                  <span>{t('auth.resendPrompt')}</span>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void handleResendVerification()}
                  >
                    {t('auth.resendShort')}
                  </button>
                </div>
              )}
            </form>

            <footer className="verify-footer">
              <Link to="/login" onClick={handleModeSwitchClick}>
                {t('auth.backToSignIn')}
              </Link>
            </footer>
          </section>
        </main>
      )}
    </div>
  );
};
