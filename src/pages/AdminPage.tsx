import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import * as api from '../services/api';
import type { ApiAdminQuizSummary, ApiAdminStats, UserProfile } from '../types/quiz';

export const AdminPage: React.FC = () => {
  const { user, uiLanguage, getErrorMessage, showToast } = useApp();

  const [stats, setStats] = useState<ApiAdminStats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [quizzes, setQuizzes] = useState<ApiAdminQuizSummary[]>([]);
  const [userQuery, setUserQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showRawJson, setShowRawJson] = useState<boolean>(false);

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
      showToast(`User #${u.id} role -> ${updated.role}`);
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
      showToast(`User #${u.id} is_active -> ${String(updated.is_active)}`);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleDeleteUser = async (u: UserProfile) => {
    if (!window.confirm(`Delete user #${u.id} (${u.email})?`)) return;
    try {
      await api.deleteAdminUser(u.id, uiLanguage);
      setUsers((prev) => prev.filter((item) => item.id !== u.id));
      showToast(`Deleted user #${u.id}`);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleDeleteQuiz = async (q: ApiAdminQuizSummary) => {
    if (!window.confirm(`Delete quiz ${q.id} (${q.title})?`)) return;
    try {
      await api.deleteAdminQuiz(q.id, uiLanguage);
      setQuizzes((prev) => prev.filter((item) => item.id !== q.id));
      showToast(`Deleted quiz ${q.id}`);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.5 }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          paddingBottom: 12,
          marginBottom: 16,
          borderBottom: '1px solid var(--border)'
        }}
      >
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            /api/v1/admin — Raw Admin Console
          </h1>
          <div style={{ color: 'var(--text-muted)' }}>
            current_user: {user ? `${user.email} (id=${user.id}, role=${user.role})` : 'none'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => void loadAll(userQuery.trim() || undefined)}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh all'}
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setShowRawJson((prev) => !prev)}
          >
            {showRawJson ? 'Hide raw JSON' : 'Show raw JSON'}
          </button>
          <Link to="/dashboard" className="btn btn-sm">
            ← Dashboard
          </Link>
        </div>
      </div>

      {error && (
        <pre
          role="alert"
          style={{
            padding: 12,
            marginBottom: 16,
            border: '1px solid var(--danger-border, #ef4444)',
            background: 'var(--surface)',
            color: '#ef4444',
            overflowX: 'auto'
          }}
        >
          ERROR: {error}
        </pre>
      )}

      {/* 1. Raw Stats */}
      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
          GET /api/v1/admin/stats
        </h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>total_users</th>
                <th>active_users</th>
                <th>verified_users</th>
                <th>admin_users</th>
                <th>total_quizzes</th>
                <th>total_attempts</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{stats?.total_users ?? '—'}</td>
                <td>{stats?.active_users ?? '—'}</td>
                <td>{stats?.verified_users ?? '—'}</td>
                <td>{stats?.admin_users ?? '—'}</td>
                <td>{stats?.total_quizzes ?? '—'}</td>
                <td>{stats?.total_attempts ?? '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Raw Users Table */}
      <section style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8
          }}
        >
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
            GET /api/v1/admin/users ({users.length})
          </h2>
          <form onSubmit={handleSearchUsers} style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              className="input"
              style={{ height: 32, width: 220, fontFamily: 'monospace', fontSize: 12 }}
              placeholder="?q=email or name"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-sm" disabled={loading}>
              Filter
            </button>
          </form>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>id</th>
                <th>email</th>
                <th>display_name</th>
                <th>role</th>
                <th>is_active</th>
                <th>email_verified_at</th>
                <th>actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 14 }}>
                    No users returned
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.email}</td>
                    <td>{u.display_name}</td>
                    <td>{u.role}</td>
                    <td>{String(u.is_active)}</td>
                    <td>{u.email_verified_at || 'null'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => void handleToggleUserRole(u)}
                        >
                          role: {u.role === 'admin' ? 'user' : 'admin'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => void handleToggleUserActive(u)}
                        >
                          active: {String(!u.is_active)}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => void handleDeleteUser(u)}
                        >
                          DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Raw Quizzes Table */}
      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
          GET /api/v1/admin/quizzes ({quizzes.length})
        </h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>id</th>
                <th>title</th>
                <th>owner_id</th>
                <th>owner_email</th>
                <th>source_type</th>
                <th>status</th>
                <th>question_count</th>
                <th>created_at</th>
                <th>actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 14 }}>
                    No quizzes returned
                  </td>
                </tr>
              ) : (
                quizzes.map((q) => (
                  <tr key={q.id}>
                    <td>{q.id}</td>
                    <td>{q.title}</td>
                    <td>{q.owner_id ?? 'null'}</td>
                    <td>{q.owner_email ?? 'null'}</td>
                    <td>{q.source_type}</td>
                    <td>{q.status}</td>
                    <td>{q.question_count}</td>
                    <td>{q.created_at}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => void handleDeleteQuiz(q)}
                      >
                        DELETE
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Raw JSON Dump */}
      {showRawJson && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
            Raw Payload Inspector
          </h2>
          <pre
            style={{
              padding: 12,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              overflowX: 'auto',
              maxHeight: 420
            }}
          >
            {JSON.stringify({ stats, users, quizzes }, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
};
