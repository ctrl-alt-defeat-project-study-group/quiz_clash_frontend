import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  value: React.ReactNode;
  label: string;
  dataName?: string;
  to?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ value, label, dataName, to }) => {
  if (to) {
    return (
      <Link to={to} className="stat-card stat-card--link" data-name={dataName || label}>
        <div className="stat-card-top">
          <div className="stat-value">{value}</div>
          <ArrowUpRight size={16} className="stat-card-arrow" aria-hidden="true" />
        </div>
        <div className="stat-label">{label}</div>
      </Link>
    );
  }

  return (
    <div className="stat-card" data-name={dataName || label}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};
