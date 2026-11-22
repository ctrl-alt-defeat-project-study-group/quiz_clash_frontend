import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeader, SectionCard } from '../components/common';
import { QuizReviewWorkspace } from '../components/quiz/QuizReviewWorkspace';

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

  useEffect(() => {
    if (id && quizzes.some((q) => q.id === id)) {
      setActiveQuizId(id);
    }
  }, [id, quizzes, setActiveQuizId]);

  useEffect(() => {
    if (activeQuiz?.backendId && !activeQuiz.questionsLoaded) {
      void loadQuizDetails(activeQuiz.id, 'preview');
    }
  }, [activeQuiz, loadQuizDetails]);

  if (!activeQuiz) {
    return (
      <>
        <PageHeader
          breadcrumbs={[
            { label: 'QuizClash', to: '/' },
            { label: t('nav.yourLibrary') }
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

  const total = activeQuiz.questions.length;

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'QuizClash', to: '/' },
          { label: t('nav.yourLibrary'), to: '/quizzes' },
          {
            label: activeQuiz.sidebarTitle || activeQuiz.title,
            siblingRoutes: quizzes.map((q) => ({
              label: q.sidebarTitle || q.title,
              active: q.id === activeQuiz.id,
              onClick: () => {
                setActiveQuizId(q.id);
                navigate(`/quizzes/${encodeURIComponent(q.id)}`);
              }
            }))
          }
        ]}
        title={activeQuiz.title}
        subtitle={t('review.subtitle', {
          count: total,
          source: activeQuiz.source || 'Uploaded_Notes.txt'
        })}
      />

      <div className="btn-row" data-name="Study actions">
        <Link to="/dashboard" className="btn">
          {t('review.backToQuizzes')}
        </Link>
        <button
          type="button"
          className="btn"
          onClick={() => void saveQuizChanges(activeQuiz.id)}
        >
          {t('common.saveChanges')}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            startPractice(activeQuiz.id);
            navigate(`/quizzes/${encodeURIComponent(activeQuiz.id)}/play`);
          }}
        >
          {t('review.startSoloQuiz')}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setLiveQuizId(activeQuiz.id);
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
              message: t('review.deleteQuizConfirmMsg', { title: activeQuiz.title }),
              confirmLabel: t('review.deleteQuiz'),
              onConfirm: () => {
                void deleteQuiz(activeQuiz.id).then((ok) => {
                  if (ok) navigate('/dashboard');
                });
              }
            });
          }}
        >
          <Trash2 size={15} aria-hidden="true" />
          <span>{t('review.deleteQuiz')}</span>
        </button>
      </div>

      <QuizReviewWorkspace key={activeQuiz.id} quiz={activeQuiz} />
    </>
  );
};
