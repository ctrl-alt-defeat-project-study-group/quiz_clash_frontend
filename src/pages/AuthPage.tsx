import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ThemeSwitch } from '../components/common';
import * as api from '../services/api';

export type AuthMode = 'login' | 'register' | 'verify' | 'forgot' | 'reset';

interface AuthPageProps {
  mode: AuthMode;
}

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

  const [motionEnabled, setMotionEnabled] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(searchParams.get('email') || '');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>('');
  const [token, setToken] = useState<string>(searchParams.get('token') || '');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [googleSubmitting, setGoogleSubmitting] = useState<boolean>(false);
  const getOAuthErrorMessage = (code: string): string => {
    const messageMap: Record<string, string> = {
      OAUTH_PROVIDER_DISABLED: t('auth.googleBackendPending'),
      OAUTH_CANCELLED: t('auth.oauthCancelled'),
      OAUTH_INVALID_STATE: t('auth.oauthInvalidState'),
      OAUTH_EMAIL_NOT_VERIFIED: t('auth.oauthEmailNotVerified'),
      ACCOUNT_DISABLED: t('auth.oauthAccountDisabled'),
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

  // Field-level validation errors matching QuizClash-Login-Register.html
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
  };

  const handleGoogleAuth = async () => {
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

      startGoogleOAuth(redirectTo);
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
      nextErrors.email = 'Enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!password) {
      nextErrors.password = 'Enter your password.';
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
      nextErrors.name = 'Enter your name.';
    }
    if (!email.trim()) {
      nextErrors.email = 'Enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!password) {
      nextErrors.password = 'Enter your password.';
    } else if (password.length < 8) {
      nextErrors.password = 'Use at least 8 characters.';
    }
    if (!confirmPassword) {
      nextErrors.confirm = 'Confirm your password.';
    } else if (confirmPassword !== password) {
      nextErrors.confirm = 'Passwords must match.';
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

  const handleAuxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorCode(undefined);
    setInfoMessage('');
    setSubmitting(true);

    try {
      if (mode === 'verify') {
        await api.verifyEmail(token.trim(), uiLanguage);
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
      setError('Enter your email address.');
      return;
    }
    setError('');
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

  const layoutMode = mode === 'register' ? 'register' : 'login';
  const isLoginOrRegister = mode === 'login' || mode === 'register';

  return (
    <div
      className="qc-auth-page"
      data-auth-mode={layoutMode}
      {...(motionEnabled ? { 'data-auth-motion': '' } : {})}
    >
      <header className="site-header">
        <div className="header-content">
          <Link className="brand" to="/">
            <span className="brand-mark" aria-hidden="true"></span>
            <span>QuizClash</span>
          </Link>

          <div className="header-right-actions">
            <ThemeSwitch variant="header" />
            <nav className="account-switch" aria-label={t('auth.eyebrow')}>
              <Link
                to="/login"
                aria-current={mode !== 'register' ? 'page' : undefined}
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
            </nav>
          </div>
        </div>
      </header>

      <main className="auth-layout">
        <div className="auth">
          {isLoginOrRegister ? (
            <>
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
                  onClick={() => void handleGoogleAuth()}
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
                          if (fieldErrors.email) {
                            setFieldErrors((prev) => ({ ...prev, email: undefined }));
                          }
                        }}
                      />
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
                      <div className="password-field">
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
                            if (fieldErrors.password) {
                              setFieldErrors((prev) => ({ ...prev, password: undefined }));
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          aria-controls="login-password"
                          aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                        >
                          {showLoginPassword ? (
                            <EyeOff size={17} aria-hidden="true" />
                          ) : (
                            <Eye size={17} aria-hidden="true" />
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
                  onClick={() => void handleGoogleAuth()}
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
                      {fieldErrors.name && (
                        <p className="field-error" id="register-name-error">
                          {fieldErrors.name}
                        </p>
                      )}
                    </div>

                    <div className="field">
                      <label htmlFor="register-email">{t('auth.emailLabel')}</label>
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
                          if (fieldErrors.email) {
                            setFieldErrors((prev) => ({ ...prev, email: undefined }));
                          }
                        }}
                      />
                      {fieldErrors.email && (
                        <p className="field-error" id="register-email-error">
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>

                    <div className="field-row-2">
                      <div className="field">
                        <label htmlFor="register-password">{t('auth.passwordLabel')}</label>
                        <div className="password-field">
                          <input
                            id="register-password"
                            name="password"
                            type={showRegisterPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            minLength={8}
                            placeholder="8+ characters"
                            required
                            value={password}
                            aria-invalid={fieldErrors.password ? 'true' : undefined}
                            aria-describedby="register-password-error"
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
                              showRegisterPassword ? 'Hide password' : 'Show password'
                            }
                            onClick={() => setShowRegisterPassword((prev) => !prev)}
                          >
                            {showRegisterPassword ? (
                              <EyeOff size={17} aria-hidden="true" />
                            ) : (
                              <Eye size={17} aria-hidden="true" />
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
                        <label htmlFor="register-confirm">Confirm password</label>
                        <div className="password-field">
                          <input
                            id="register-confirm"
                            name="passwordConfirmation"
                            type={showConfirmPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="Repeat password"
                            required
                            value={confirmPassword}
                            aria-invalid={fieldErrors.confirm ? 'true' : undefined}
                            aria-describedby="register-confirm-error"
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
                                ? 'Hide password confirmation'
                                : 'Show password confirmation'
                            }
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={17} aria-hidden="true" />
                            ) : (
                              <Eye size={17} aria-hidden="true" />
                            )}
                          </button>
                        </div>
                        {fieldErrors.confirm && (
                          <p className="field-error" id="register-confirm-error">
                            {fieldErrors.confirm}
                          </p>
                        )}
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
                      {error}
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
            </>
          ) : (
            /* VERIFY EMAIL / FORGOT PASSWORD / RESET PASSWORD VIEW */
            <section data-view="aux" aria-labelledby="aux-heading">
              <h1 id="aux-heading" tabIndex={-1}>
                {mode === 'verify'
                  ? t('auth.verifyTitle')
                  : mode === 'forgot'
                  ? t('auth.forgotTitle')
                  : t('auth.resetTitle')}
              </h1>
              <p className="intro">
                {mode === 'verify'
                  ? t('auth.verifySubtitle')
                  : mode === 'forgot'
                  ? t('auth.forgotSubtitle')
                  : t('auth.resetSubtitle')}
              </p>

              <form method="post" onSubmit={handleAuxSubmit}>
                <fieldset className="form-fields" disabled={submitting}>
                  {(mode === 'forgot' || mode === 'verify') && (
                    <div className="field">
                      <label htmlFor="aux-email">{t('auth.emailLabel')}</label>
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
                  )}

                  {(mode === 'verify' || mode === 'reset') && (
                    <div className="field">
                      <label htmlFor="aux-token">{t('auth.tokenLabel')}</label>
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
                  )}

                  {mode === 'reset' && (
                    <div className="field">
                      <label htmlFor="aux-password">{t('auth.newPasswordLabel')}</label>
                      <div className="password-field">
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
                          aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                        >
                          {showLoginPassword ? (
                            <EyeOff size={17} aria-hidden="true" />
                          ) : (
                            <Eye size={17} aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <button className="submit-button" type="submit" disabled={submitting}>
                    <span>
                      {submitting
                        ? t('auth.submitting')
                        : mode === 'verify'
                        ? t('auth.verifyBtn').replace(/\s*→$/, '')
                        : mode === 'forgot'
                        ? t('auth.forgotBtn').replace(/\s*→$/, '')
                        : t('auth.resetBtn').replace(/\s*→$/, '')}
                    </span>
                    {!submitting && (
                      <span className="submit-arrow" aria-hidden="true">
                        →
                      </span>
                    )}
                  </button>

                  {mode === 'verify' && (
                    <button
                      type="button"
                      className="google-button"
                      onClick={() => void handleResendVerification()}
                      disabled={submitting}
                    >
                      {t('auth.resendBtn')}
                    </button>
                  )}
                </fieldset>

                {error && (
                  <div className="form-status is-error" role="alert">
                    {error}
                  </div>
                )}

                {infoMessage && (
                  <p className="form-status" role="status">
                    {infoMessage}
                  </p>
                )}
              </form>

              <p className="view-switch">
                <Link to="/login" onClick={handleModeSwitchClick}>
                  {t('auth.backToSignIn')}
                </Link>
              </p>
            </section>
          )}
        </div>

        <figure
          className="study-scene"
          aria-label="QuizClash preview: practice quiz and attempt history"
        >
          <div className="card-stack">
            <div className="stack-backdrop" aria-hidden="true"></div>
            <div className="preview-card history-card">
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

            <div className="preview-card quiz-card">
              <p className="preview-meta">
                <span>Practice quiz</span>
                <span>2 / 5</span>
              </p>
              <div className="quiz-progress" aria-hidden="true"></div>
              <p className="preview-title">
                What is the name of this Website?
              </p>
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
          </div>
        </figure>
      </main>
    </div>
  );
};
