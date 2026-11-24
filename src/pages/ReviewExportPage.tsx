import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FolderOpen, Play, Search, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppPagination, PageHeader, SectionCard } from '../components/common';
import { QuizReviewWorkspace } from '../components/quiz/QuizReviewWorkspace';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const LIBRARY_PAGE_SIZE = 10;

export const ReviewExportPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const {
    quizzes,
    activeQuiz,
    setActiveQuizId,
    loadQuizDetails,
    saveQuizChanges,
    deleteQuiz,
    startPractice,
    setLiveQuizId,
    openModal,
    t
  } = useApp();

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('__all__');
  const [page, setPage] = useState<number>(1);

  const isLibraryIndex = !id;

  useEffect(() => {
    if (id && quizzes.some((q) => q.id === id)) {
      setActiveQuizId(id);
    }
  }, [id, quizzes, setActiveQuizId]);

  const targetQuiz = id ? quizzes.find((q) => q.id === id) ?? activeQuiz : activeQuiz;

  useEffect(() => {
    if (!isLibraryIndex && targetQuiz?.backendId && !targetQuiz.questionsLoaded) {
      void loadQuizDetails(targetQuiz.id, 'preview');
    }
  }, [isLibraryIndex, targetQuiz, loadQuizDetails]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    quizzes.forEach((q) => {
      if (q.category?.trim()) set.add(q.category.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [quizzes]);

  const filteredQuizzes = useMemo(() => {
    const qLower = searchQuery.trim().toLowerCase();
    return quizzes.filter((q) => {
      if (selectedCategory !== '__all__' && (q.category || '').trim() !== selectedCategory) {
        return false;
      }
      if (!qLower) return true;
      return (
        q.title.toLowerCase().includes(qLower) ||
        (q.category || '').toLowerCase().includes(qLower) ||
        (q.source || '').toLowerCase().includes(qLower)
      );
    });
  }, [quizzes, searchQuery, selectedCategory]);

  // Library Index View (/quizzes without an :id)
  if (isLibraryIndex) {
    const totalPages = Math.max(1, Math.ceil(filteredQuizzes.length / LIBRARY_PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pagedQuizzes = filteredQuizzes.slice(
      (safePage - 1) * LIBRARY_PAGE_SIZE,
      safePage * LIBRARY_PAGE_SIZE
    );

    return (
      <>
        <PageHeader
          breadcrumbs={[
            { label: 'QuizClash', to: '/' },
            { label: t('nav.myQuizzes') }
          ]}
          title={t('nav.myQuizzes')}
          subtitle={t('review.librarySubtitle')}
          actions={
            <Link to="/generate" className="btn btn-primary">
              {t('dashboard.createQuizBtn')}
            </Link>
          }
        />

        {quizzes.length === 0 ? (
          <SectionCard>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                alignItems: 'flex-start'
              }}
            >
              <p className="helper-text">{t('dashboard.bannerTitle')}</p>
              <Link to="/generate" className="btn btn-primary">
                {t('dashboard.createQuizBtn')}
              </Link>
            </div>
          </SectionCard>
        ) : (
          <SectionCard className="myq-records" dataName="My quizzes library">
            <div className="myq-toolbar">
              <div className="myq-filters">
                <div className="myq-search-wrap">
                  <Search
                    size={15}
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: 11,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                      pointerEvents: 'none'
                    }}
                  />
                  <input
                    type="text"
                    className="input"
                    style={{ paddingLeft: 34 }}
                    placeholder={t('review.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>

                {categories.length > 0 && (
                  <div className="myq-category-wrap">
                    <Select
                      value={selectedCategory}
                      onValueChange={(val) => {
                        setSelectedCategory(val);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="__all__">{t('review.allCategories')}</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <span className="helper-text myq-count">
                {t('review.showingQuizzes', {
                  shown: filteredQuizzes.length,
                  total: quizzes.length
                })}
              </span>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('dashboard.colQuizName')}</th>
                    <th>{t('dashboard.colQuestions')}</th>
                    <th>{t('dashboard.colLastScore')}</th>
                    <th>{t('dashboard.colUpdated')}</th>
                    <th>{t('dashboard.colAction')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedQuizzes.length === 0 ? (
                    <tr className="myq-empty-row">
                      <td colSpan={5} className="helper-text" style={{ textAlign: 'center', padding: 24 }}>
                        {t('review.noMatchingQuizzes')}
                      </td>
                    </tr>
                  ) : (
                    pagedQuizzes.map((q) => (
                      <tr key={q.id}>
                        <td className="myq-cell-title">
                          {q.category && (
                            <div className="myq-category-mobile helper-text">{q.category}</div>
                          )}
                          <div style={{ fontWeight: 600 }}>{q.title}</div>
                          {q.category && (
                            <div className="myq-category-desktop helper-text" style={{ fontSize: 12 }}>
                              {q.category}
                            </div>
                          )}
                        </td>
                        <td className="myq-cell-questions">
                          {t('common.questionsCount', {
                            count: q.questionCount ?? q.questions.length
                          })}
                        </td>
                        <td className="myq-cell-score">
                          <span className="score-badge">{q.lastScore ?? 0}%</span>
                        </td>
                        <td className="myq-cell-updated">
                          <span className="myq-mobile-label" aria-hidden="true">
                            {t('dashboard.colUpdated')}
                          </span>
                          <span>{q.updated || t('common.today')}</span>
                        </td>
                        <td className="myq-cell-actions">
                          <div className="table-action-group">
                            <button
                              type="button"
                              className="table-action-btn is-primary"
                              title={t('dashboard.openQuiz')}
                              aria-label={t('dashboard.openQuiz')}
                              onClick={() => {
                                setActiveQuizId(q.id);
                                navigate(`/quizzes/${encodeURIComponent(q.id)}`);
                              }}
                            >
                              <FolderOpen size={15} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="table-action-btn is-primary"
                              title={t('review.playSoloShort')}
                              aria-label={t('review.playSoloShort')}
                              onClick={() => {
                                startPractice(q.id);
                                navigate(`/quizzes/${encodeURIComponent(q.id)}/play`);
                              }}
                            >
                              <Play size={15} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="table-action-btn is-danger"
                              title={t('review.deleteQuiz')}
                              aria-label={t('review.deleteQuiz')}
                              onClick={() => {
                                openModal({
                                  title: t('review.deleteQuizConfirmTitle'),
                                  message: t('review.deleteQuizConfirmMsg', { title: q.title }),
                                  confirmLabel: t('review.deleteQuiz'),
                                  onConfirm: () => {
                                    void deleteQuiz(q.id);
                                  }
                                });
                              }}
                            >
                              <Trash2 size={15} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ marginTop: 14 }}>
                <AppPagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </SectionCard>
        )}
      </>
    );
  }

  if (!targetQuiz) {
    return (
      <>
        <PageHeader
          breadcrumbs={[
            { label: 'QuizClash', to: '/' },
            { label: t('nav.yourLibrary'), to: '/quizzes' }
          ]}
          title={t('nav.myQuizzes')}
          subtitle={t('dashboard.bannerBody')}
        />
        <SectionCard>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              alignItems: 'flex-start'
            }}
          >
            <p className="helper-text">{t('dashboard.bannerTitle')}</p>
            <Link to="/generate" className="btn btn-primary">
              {t('dashboard.createQuizBtn')}
            </Link>
          </div>
        </SectionCard>
      </>
    );
  }

  const total = targetQuiz.questions.length;

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'QuizClash', to: '/' },
          { label: t('nav.yourLibrary'), to: '/quizzes' },
          {
            label: targetQuiz.sidebarTitle || targetQuiz.title,
            siblingRoutes: quizzes.map((q) => ({
              label: q.sidebarTitle || q.title,
              active: q.id === targetQuiz.id,
              onClick: () => {
                setActiveQuizId(q.id);
                navigate(`/quizzes/${encodeURIComponent(q.id)}`);
              }
            }))
          }
        ]}
        title={targetQuiz.title}
        subtitle={t('review.subtitle', {
          count: total,
          source: targetQuiz.source || 'Uploaded_Notes.txt'
        })}
      />

      <div className="btn-row" data-name="Study actions">
        <Link to="/quizzes" className="btn">
          {t('review.backToQuizzes')}
        </Link>
        <button
          type="button"
          className="btn"
          onClick={() => void saveQuizChanges(targetQuiz.id)}
        >
          {t('common.saveChanges')}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            startPractice(targetQuiz.id);
            navigate(`/quizzes/${encodeURIComponent(targetQuiz.id)}/play`);
          }}
        >
          {t('review.startSoloQuiz')}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setLiveQuizId(targetQuiz.id);
            navigate('/lobby');
          }}
        >
          {t('review.hostLiveGame')}
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => {
            openModal({
              title: t('review.deleteQuizConfirmTitle'),
              message: t('review.deleteQuizConfirmMsg', { title: targetQuiz.title }),
              confirmLabel: t('review.deleteQuiz'),
              onConfirm: () => {
                void deleteQuiz(targetQuiz.id).then((ok) => {
                  if (ok) navigate('/quizzes');
                });
              }
            });
          }}
        >
          <Trash2 size={15} aria-hidden="true" />
          <span>{t('review.deleteQuiz')}</span>
        </button>
      </div>

      <QuizReviewWorkspace key={targetQuiz.id} quiz={targetQuiz} />
    </>
  );
};
