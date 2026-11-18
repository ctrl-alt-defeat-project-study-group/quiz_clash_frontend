import React from 'react';

interface SectionCardProps {
  title?: React.ReactNode;
  headerRight?: React.ReactNode;
  dataName?: string;
  className?: string;
  style?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  headerRight,
  dataName,
  className = '',
  style,
  headerStyle,
  children
}) => {
  return (
    <section
      className={`box-card ${className}`.trim()}
      data-name={dataName}
      style={style}
    >
      {(title || headerRight) && (
        <div className="section-header" style={headerStyle}>
          {typeof title === 'string' ? (
            <h2 className="section-title">{title}</h2>
          ) : (
            title
          )}
          {headerRight}
        </div>
      )}
      {children}
    </section>
  );
};
