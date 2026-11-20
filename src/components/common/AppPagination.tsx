import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export interface AppPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  ariaLabel?: string;
}

function getPageItems(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Always return a fixed 7-slot layout so Previous/Next controls never shift position
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      'ellipsis',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    'ellipsis',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis',
    totalPages,
  ];
}

export const AppPagination: React.FC<AppPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  ariaLabel,
}) => {
  const { t } = useApp();
  if (totalPages <= 0) return null;

  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;
  const items = getPageItems(currentPage, totalPages);

  return (
    <Pagination aria-label={ariaLabel || t('common.pagination')} className={className}>
      <PaginationContent className="flex-wrap justify-center">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            label={t('common.previous')}
            aria-label={t('common.goToPreviousPage')}
            aria-disabled={isFirst || undefined}
            tabIndex={isFirst ? -1 : undefined}
            className={cn(
              isFirst ? 'pointer-events-none opacity-50' : 'cursor-pointer'
            )}
            onClick={(e) => {
              e.preventDefault();
              if (!isFirst) onPageChange(currentPage - 1);
            }}
          />
        </PaginationItem>

        {items.map((item, idx) =>
          item === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis label={t('common.morePages')} />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                isActive={item === currentPage}
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  if (item !== currentPage) onPageChange(item);
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            label={t('common.next')}
            aria-label={t('common.goToNextPage')}
            aria-disabled={isLast || undefined}
            tabIndex={isLast ? -1 : undefined}
            className={cn(
              isLast ? 'pointer-events-none opacity-50' : 'cursor-pointer'
            )}
            onClick={(e) => {
              e.preventDefault();
              if (!isLast) onPageChange(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
