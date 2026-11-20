import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export interface BreadcrumbRouteOption {
  label: string;
  to?: string;
  onClick?: () => void;
  active?: boolean;
}

export interface BreadcrumbTrailItem {
  label: string;
  to?: string;
  onClick?: () => void;
  siblingRoutes?: BreadcrumbRouteOption[];
}

interface PageHeaderProps {
  eyebrow?: string;
  breadcrumbs?: BreadcrumbTrailItem[];
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  dataName?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  breadcrumbs,
  title,
  subtitle,
  actions,
  children,
  dataName = 'Page heading'
}) => {
  const { t } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const defaultTopRoutes: BreadcrumbRouteOption[] = [
    {
      label: t('nav.dashboard'),
      to: '/dashboard',
      active: path === '/dashboard' || path === '/' || path === '/s1'
    },
    {
      label: t('nav.generateQuiz'),
      to: '/generate',
      active: path.startsWith('/generate') || path === '/s2'
    },
    {
      label: t('nav.yourLibrary'),
      to: '/quizzes',
      active:
        path.startsWith('/quizzes') ||
        path.startsWith('/play') ||
        path === '/s3' ||
        path === '/s4'
    },
    {
      label: t('nav.attemptHistory'),
      to: '/history',
      active:
        path.startsWith('/history') ||
        path.startsWith('/results') ||
        path.startsWith('/attempts') ||
        path === '/s5'
    },
    {
      label: t('nav.liveGames'),
      to: '/lobby',
      active:
        path.startsWith('/lobby') ||
        path.startsWith('/rooms') ||
        path.startsWith('/leaderboard') ||
        path === '/s6' ||
        path === '/s7'
    },
    {
      label: t('nav.helpSettings'),
      to: '/settings',
      active: path.startsWith('/settings') || path === '/s8'
    }
  ];

  return (
    <div className="page-heading" data-name={dataName}>
      <div className="heading-copy">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <Breadcrumb className="page-header-breadcrumb">
            <BreadcrumbList>
              {breadcrumbs.map((item, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                const sepRoutes =
                  idx > 0
                    ? item.siblingRoutes && item.siblingRoutes.length > 0
                      ? item.siblingRoutes
                      : idx === 1
                      ? defaultTopRoutes
                      : undefined
                    : undefined;

                return (
                  <React.Fragment key={`${item.label}-${idx}`}>
                    {idx > 0 && (
                      <BreadcrumbSeparator aria-hidden={sepRoutes ? undefined : true}>
                        {sepRoutes ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="breadcrumb-sep-trigger"
                                aria-label="Show available routes"
                              >
                                <ChevronRight size={14} aria-hidden="true" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="min-w-[170px]">
                              {sepRoutes.map((route) => (
                                <DropdownMenuItem
                                  key={route.label}
                                  className="flex items-center justify-between gap-2 cursor-pointer"
                                  onSelect={() => {
                                    if (route.onClick) {
                                      route.onClick();
                                    } else if (route.to) {
                                      navigate(route.to);
                                    }
                                  }}
                                >
                                  <span>{route.label}</span>
                                  {route.active && (
                                    <Check size={14} className="text-[var(--primary)]" />
                                  )}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : undefined}
                      </BreadcrumbSeparator>
                    )}
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="page-header-breadcrumb-current">
                          {item.label}
                        </BreadcrumbPage>
                      ) : item.to ? (
                        <BreadcrumbLink asChild>
                          <Link to={item.to}>{item.label}</Link>
                        </BreadcrumbLink>
                      ) : item.onClick ? (
                        <BreadcrumbLink asChild>
                          <button
                            type="button"
                            className="page-header-breadcrumb-btn"
                            onClick={item.onClick}
                          >
                            {item.label}
                          </button>
                        </BreadcrumbLink>
                      ) : (
                        <span>{item.label}</span>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          eyebrow && <div className="eyebrow">{eyebrow}</div>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
        {children}
      </div>
      {actions}
    </div>
  );
};
