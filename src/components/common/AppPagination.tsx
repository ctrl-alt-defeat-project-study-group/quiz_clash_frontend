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

  const pages: Array<number | 'ellipsis'> = [1];

  if (currentPage > 3) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let p = start; p <= end; p++) {
    pages.push(p);
  }

  if (currentPage < totalPages - 2) {
    pages.push('ellipsis');
  }

  pages.push(totalPages);
  return pages;
}

export const AppPagination: React.FC<AppPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  ariaLabel = 'Pagination',
}) => {
  if (totalPages <= 0) return null;

  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;
  const items = getPageItems(currentPage, totalPages);

  return (
    <Pagination aria-label={ariaLabel} className={className}>
      <PaginationContent className="flex-wrap justify-center">
        <PaginationItem>
          <PaginationPrevious
            href="#"
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
              <PaginationEllipsis />
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
