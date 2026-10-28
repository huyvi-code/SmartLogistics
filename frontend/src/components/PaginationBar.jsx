import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PaginationBar = ({
  totalItems = 0,
  pageSize = 10,
  setPageSize,
  currentPage = 1,
  setCurrentPage,
  itemLabel = 'dòng',
  sizeSuffix = ' dòng',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIdx = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endIdx = Math.min(totalItems, safeCurrentPage * pageSize);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
      {/* Left: Showing range & Page size selector (10 - 20 - 50) */}
      <div className="flex flex-wrap items-center gap-3">
        <span>
          Hiển thị{' '}
          <strong className="text-slate-900 dark:text-white">{startIdx}</strong>
          {' – '}
          <strong className="text-slate-900 dark:text-white">{endIdx}</strong>
          {' trên tổng '}
          <strong className="text-slate-900 dark:text-white">{totalItems}</strong> {itemLabel}
        </span>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="px-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Hiển thị
          </span>
          {[10, 20, 50].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                pageSize === size
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
              }`}
            >
              {size}{sizeSuffix}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Page navigation */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
          disabled={safeCurrentPage <= 1}
          className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-semibold cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Trước
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                page === safeCurrentPage
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
          disabled={safeCurrentPage >= totalPages}
          className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-semibold cursor-pointer"
        >
          Sau <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
