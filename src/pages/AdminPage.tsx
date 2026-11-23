import React, { useCallback, useEffect, useState } from 'react';
import { Code2, RefreshCw, Search, Shield, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import * as api from '../services/api';
import type { ApiAdminQuizSummary, ApiAdminStats, UserProfile } from '../types/quiz';
import { AdminPageSkeleton, AppPagination, PageHeader, SectionCard, StatCard } from '../components/common';

const PAGE_SIZE = 10;

export const AdminPage: React.FC = () => {
  const { user, uiLanguage, getErrorMessage, openModal, showToast, t } = useApp();

  const [stats, setStats] = useState<ApiAdminStats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [quizzes, setQuizzes] = useState<ApiAdminQuizSummary[]>([]);
  const [userQuery, setUserQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const [usersPage, setUsersPage] = useState<number>(1);
  const [quizzesPage, setQuizzesPage] = useState<number>(1);

  const loadAll = useCallback(
    async (query?: string) => {
      setLoading(true);
      setError('');
      try {
        const [statsRes, usersRes, quizzesRes] = await Promise.all([
          api.getAdminStats(uiLanguage),
          api.listAdminUsers(query, uiLanguage),
          api.listAdminQuizzes(uiLanguage)
        ]);
        setStats(statsRes);
        setUsers(usersRes);
        setQuizzes(quizzesRes);
        setUsersPage(1);
        setQuizzesPage(1);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [getErrorMessage, uiLanguage]
  );

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const [statsRes, usersRes, quizzesRes] = await Promise.all([
          api.getAdminStats(uiLanguage),
          api.listAdminUsers(undefined, uiLanguage),
          api.listAdminQuizzes(uiLanguage)
        ]);
        if (!active) return;
        setStats(statsRes);
        setUsers(usersRes);
        setQuizzes(quizzesRes);
        setError('');
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [getErrorMessage, uiLanguage]);

  const handleSearchUsers = (e: React.FormEvent) => {
    e.preventDefault();
    void loadAll(userQuery.trim() || undefined);
  };

  const handleToggleUserRole = async (u: UserProfile) => {
    const nextRole = u.role === 'admin' ? 'user' : 'admin';
    try {
      const updated = await api.updateAdminUser(u.id, { role: nextRole }, uiLanguage);
      setUsers((prev) => prev.map((item) => (item.id === u.id ? updated : item)));
      showToast(t('admin.toastRoleUpdated', { id: u.id, role: updated.role }));
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleToggleUserActive = async (u: UserProfile) => {
    try {
      const updated = await api.updateAdminUser(
        u.id,
        { is_active: !u.is_active },
        uiLanguage
      );
      setUsers((prev) => prev.map((item) => (item.id === u.id ? updated : item)));
      showToast(t('admin.toastStatusUpdated', { id: u.id }));
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleDeleteUser = (u: UserProfile) => {
    openModal({
      title: t('admin.deleteUserConfirmTitle'),
      message: t('admin.deleteUserConfirmMsg', { email: u.email }),
      confirmLabel: t('common.delete'),
      onConfirm: () => {
        void (async () => {
          try {
            await api.deleteAdminUser(u.id, uiLanguage);
            setUsers((prev) => prev.filter((item) => item.id !== u.id));
            showToast(t('admin.toastUserDeleted', { id: u.id }));
          } catch (err) {
            showToast(getErrorMessage(err), 'error');
          }
        })();
      }
    });
  };

  const handleDeleteQuiz = (q: ApiAdminQuizSummary) => {
    openModal({
      title: t('admin.deleteQuizConfirmTitle'),
      message: t('admin.deleteQuizConfirmMsg', { title: q.title }),
      confirmLabel: t('common.delete'),
      onConfirm: () => {
        void (async () => {
          try {
            await api.deleteAdminQuiz(q.id, uiLanguage);
            setQuizzes((prev) => prev.filter((item) => item.id !== q.id));
            showToast(t('admin.toastQuizDeleted', { id: q.id }));
          } catch (err) {
            showToast(getErrorMessage(err), 'error');
          }
        })();
      }
    });
  };

  const formatShortDate = (iso: string | null | undefined) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const usersTotalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const safeUsersPage = Math.min(usersPage, usersTotalPages);
  const pagedUsers = users.slice(
    (safeUsersPage - 1) * PAGE_SIZE,
    safeUsersPage * PAGE_SIZE
  );

  const quizzesTotalPages = Math.max(1, Math.ceil(quizzes.length / PAGE_SIZE));
  const safeQuizzesPage = Math.min(quizzesPage, quizzesTotalPages);
  const pagedQuizzes = quizzes.slice(
    (safeQuizzesPage - 1) * PAGE_SIZE,
    safeQuizzesPage * PAGE_SIZE
  );

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'QuizClash', to: '/' },
          { label: t('nav.adminPanel') }
        ]}
        title={t('admin.title')}
        subtitle={
          user
            ? `${t('admin.subtitle')} · ${user.email}`
            : t('admin.subtitle')
        }
        actions={
          <div className="btn-row">
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setShowRawJson((prev) => !prev)}
            >
              <Code2 size={14} aria-hidden="true" />
              <span>{showRawJson ? t('admin.hideRawJson') : t('admin.showRawJson')}</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => void loadAll(userQuery.trim() || undefined)}
              disabled={loading}
            >
              <RefreshCw
                size={14}
                className={loading ? 'animate-spin' : undefined}
                aria-hidden="true"
              />
              <span>{loading ? t('admin.refreshingBtn') : t('admin.refreshBtn')}</span>
            </button>
          </div>
        }
      />

      {error && (
        <SectionCard>
          <p className="error-text" role="alert" style={{ margin: 0 }}>
            {error}
          </p>
        </SectionCard>
      )}

      {loading && !stats && !error ? (
        <AdminPageSkeleton />
      ) : (
        <>
          {/* Platform Stats */}
      <section className="stat-grid-3" aria-label={t('admin.title')}>
        <StatCard value={stats?.total_users ?? '—'} label={t('admin.statTotalUsers')} />
        <StatCard value={stats?.active_users ?? '—'} label={t('admin.statActiveUsers')} />
        <StatCard value={stats?.verified_users ?? '—'} label={t('admin.statVerifiedUsers')} />
      </section>
      <section className="stat-grid-3" aria-label={t('admin.title')}>
        <StatCard value={stats?.admin_users ?? '—'} label={t('admin.statAdminUsers')} />
        <StatCard value={stats?.total_quizzes ?? '—'} label={t('admin.statTotalQuizzes')} />
        <StatCard value={stats?.total_attempts ?? '—'} label={t('admin.statTotalAttempts')} />
      </section>

      {/* Users Table */}
      <SectionCard dataName="Admin users">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 16
          }}
        >
          <div>
            <h2 className="section-title" style={{ marginBottom: 4 }}>
              {t('admin.usersTitle', { count: users.length })}
            </h2>
            <p className="helper-text" style={{ margin: 0 }}>
              {t('admin.usersSubtitle')}
            </p>
          </div>

          <form onSubmit={handleSearchUsers} style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                className="input"
                style={{ height: 34, width: 220, paddingLeft: 30, fontSize: 13 }}
                placeholder={t('admin.searchUsersPlaceholder')}
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-sm" disabled={loading}>
              {t('admin.filterBtn')}
            </button>
          </form>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('admin.colName')}</th>
                <th>{t('admin.colEmail')}</th>
                <th>{t('admin.colRole')}</th>
                <th>{t('admin.colStatus')}</th>
                <th>{t('admin.colVerified')}</th>
                <th>{t('admin.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="helper-text" style={{ textAlign: 'center', padding: 20 }}>
                    {t('admin.noUsers')}
                  </td>
                </tr>
              ) : (
                pagedUsers.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.display_name || `#${u.id}`}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="score-badge">
                        {u.role === 'admin' && (
                          <Shield size={12} style={{ marginRight: 4, display: 'inline' }} aria-hidden="true" />
                        )}
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className="helper-text">
                        {u.is_active ? t('admin.statusActive') : t('admin.statusDisabled')}
                      </span>
                    </td>
                    <td>
                      <span className="helper-text">
                        {u.email_verified_at ? t('admin.verifiedYes') : t('admin.verifiedNo')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => void handleToggleUserRole(u)}
                        >
                          {u.role === 'admin' ? t('admin.makeUser') : t('admin.makeAdmin')}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => void handleToggleUserActive(u)}
                        >
                          {u.is_active ? t('admin.disableUser') : t('admin.enableUser')}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteUser(u)}
                          disabled={user?.id === u.id}
                        >
                          <Trash2 size={13} aria-hidden="true" />
                          <span>{t('common.delete')}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {usersTotalPages > 1 && (
          <div style={{ marginTop: 14 }}>
            <AppPagination
              currentPage={safeUsersPage}
              totalPages={usersTotalPages}
              onPageChange={setUsersPage}
            />
          </div>
        )}
      </SectionCard>

      {/* Quizzes Table */}
      <SectionCard dataName="Admin quizzes">
        <h2 className="section-title" style={{ marginBottom: 4 }}>
          {t('admin.quizzesTitle', { count: quizzes.length })}
        </h2>
        <p className="helper-text" style={{ marginBottom: 16 }}>
          {t('admin.quizzesSubtitle')}
        </p>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('admin.colTitle')}</th>
                <th>{t('admin.colOwner')}</th>
                <th>{t('admin.colSource')}</th>
                <th>{t('admin.colQuestions')}</th>
                <th>{t('admin.colCreated')}</th>
                <th>{t('admin.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {pagedQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="helper-text" style={{ textAlign: 'center', padding: 20 }}>
                    {t('admin.noQuizzes')}
                  </td>
                </tr>
              ) : (
                pagedQuizzes.map((q) => (
                  <tr key={q.id}>
                    <td style={{ fontWeight: 600 }}>{q.title}</td>
                    <td>{q.owner_email || (q.owner_id ? `#${q.owner_id}` : '—')}</td>
                    <td>
                      <span className="score-badge">{q.source_type}</span>
                    </td>
                    <td>{t('common.questionsCount', { count: q.question_count })}</td>
                    <td>{formatShortDate(q.created_at)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteQuiz(q)}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                        <span>{t('common.delete')}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {quizzesTotalPages > 1 && (
          <div style={{ marginTop: 14 }}>
            <AppPagination
              currentPage={safeQuizzesPage}
              totalPages={quizzesTotalPages}
              onPageChange={setQuizzesPage}
            />
          </div>
        )}
      </SectionCard>

      {/* Optional Raw JSON Inspector */}
      {showRawJson && (
        <SectionCard title={t('admin.rawPayloadTitle')}>
          <pre
            style={{
              padding: 12,
              borderRadius: 8,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-elevated)',
              overflowX: 'auto',
              maxHeight: 420,
              fontSize: 12,
              margin: 0
            }}
          >
            {JSON.stringify({ stats, users, quizzes }, null, 2)}
          </pre>
        </SectionCard>
      )}
        </>
      )}
    </>
  );
};
