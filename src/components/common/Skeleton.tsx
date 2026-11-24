import React from 'react';
import { SectionCard } from './SectionCard';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 14,
  radius = 6,
  className = '',
  style
}) => (
  <span
    className={`qc-skeleton ${className}`.trim()}
    aria-hidden="true"
    style={{
      width,
      height,
      borderRadius: radius,
      ...style
    }}
  />
);

export const AdminPageSkeleton: React.FC = () => (
  <div role="status" aria-live="polite" aria-label="Loading admin data">
    <section className="stat-grid-3" style={{ marginBottom: 16 }}>
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={`stat-a-${idx}`} className="stat-card">
          <Skeleton width={68} height={28} radius={6} />
          <Skeleton width="62%" height={13} style={{ marginTop: 10 }} />
        </div>
      ))}
    </section>
    <section className="stat-grid-3" style={{ marginBottom: 20 }}>
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={`stat-b-${idx}`} className="stat-card">
          <Skeleton width={68} height={28} radius={6} />
          <Skeleton width="58%" height={13} style={{ marginTop: 10 }} />
        </div>
      ))}
    </section>

    <SectionCard>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: '1 1 200px' }}>
          <Skeleton width={160} height={18} />
          <Skeleton width={240} height={13} />
        </div>
        <Skeleton width={220} height={34} radius={8} />
      </div>
      <div className="qc-skeleton-table">
        {Array.from({ length: 5 }).map((_, rowIdx) => (
          <div key={`user-row-${rowIdx}`} className="qc-skeleton-table-row">
            <Skeleton width="22%" height={14} />
            <Skeleton width="28%" height={14} />
            <Skeleton width="12%" height={22} radius={999} />
            <Skeleton width="12%" height={22} radius={999} />
            <Skeleton width="14%" height={28} radius={6} />
          </div>
        ))}
      </div>
    </SectionCard>

    <SectionCard>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <Skeleton width={150} height={18} />
        <Skeleton width={220} height={13} />
      </div>
      <div className="qc-skeleton-table">
        {Array.from({ length: 4 }).map((_, rowIdx) => (
          <div key={`quiz-row-${rowIdx}`} className="qc-skeleton-table-row">
            <Skeleton width="30%" height={14} />
            <Skeleton width="24%" height={14} />
            <Skeleton width="14%" height={14} />
            <Skeleton width="12%" height={22} radius={999} />
            <Skeleton width="10%" height={28} radius={6} />
          </div>
        ))}
      </div>
    </SectionCard>
  </div>
);

export const AttemptDetailsSkeleton: React.FC = () => (
  <div
    className="missed-grid"
    role="status"
    aria-live="polite"
    aria-label="Loading attempt details"
  >
    {Array.from({ length: 4 }).map((_, idx) => (
      <article key={`attempt-skel-${idx}`} className="feedback-card">
        <Skeleton width={92} height={12} />
        <Skeleton width="90%" height={18} style={{ marginTop: 8 }} />
        <Skeleton width="72%" height={18} style={{ marginTop: 6 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
          <Skeleton width="64%" height={13} />
          <Skeleton width="68%" height={13} />
        </div>
        <Skeleton width="84%" height={12} style={{ marginTop: 12 }} />
      </article>
    ))}
  </div>
);

export const SoloQuizSkeleton: React.FC = () => (
  <div
    className="qp-workspace"
    role="status"
    aria-live="polite"
    aria-label="Loading quiz questions"
  >
    <section className="box-card" style={{ padding: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          marginBottom: 18
        }}
      >
        <Skeleton width={130} height={14} />
        <Skeleton width={84} height={24} radius={999} />
      </div>
      <Skeleton width="88%" height={24} />
      <Skeleton width="64%" height={24} style={{ marginTop: 8, marginBottom: 24 }} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12
        }}
      >
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={`choice-skel-${idx}`}
            className="box-subtle"
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <Skeleton width={28} height={28} radius={8} />
            <Skeleton width="74%" height={15} />
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 24
        }}
      >
        <Skeleton width={104} height={38} radius={8} />
        <Skeleton width={120} height={38} radius={8} />
      </div>
    </section>
  </div>
);

export const ReviewWorkspaceSkeleton: React.FC = () => (
  <div
    className="review-columns"
    style={{ alignItems: 'stretch' }}
    role="status"
    aria-live="polite"
    aria-label="Loading quiz workspace"
  >
    <section className="box-card" style={{ padding: 22 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18
        }}
      >
        <Skeleton width={140} height={18} />
        <Skeleton width={96} height={30} radius={6} />
      </div>
      <Skeleton width={90} height={12} style={{ marginBottom: 8 }} />
      <Skeleton width="100%" height={76} radius={8} style={{ marginBottom: 18 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={`rev-choice-${idx}`}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <Skeleton width={32} height={32} radius={8} />
            <Skeleton width="100%" height={38} radius={8} />
          </div>
        ))}
      </div>
    </section>

    <aside className="box-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Skeleton width={120} height={18} />
      <Skeleton width="85%" height={13} />
      <Skeleton width="100%" height={40} radius={8} />
      <Skeleton width="100%" height={40} radius={8} />
      <Skeleton width="100%" height={40} radius={8} />
    </aside>
  </div>
);
