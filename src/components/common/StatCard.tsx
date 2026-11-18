import React from 'react';

interface StatCardProps {
  value: React.ReactNode;
  label: string;
  dataName?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ value, label, dataName }) => {
  return (
    <div className="stat-card" data-name={dataName || label}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};
