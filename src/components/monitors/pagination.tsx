import { useEffect } from "react";

export const Pagination = ({
  totalItems,
  pageSize,
  currentPage,
  setCurrentPage,
  setPageSize,
}: {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  setCurrentPage: (v: number | ((p: number) => number)) => void;
  setPageSize: (v: number) => void;
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Auto-clamp currentPage when it exceeds totalPages (e.g. after data/pageSize changes)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages, setCurrentPage]);
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-end gap-4 text-sm text-gray-500">
      {/* info */}
      <span>
        {totalItems === 0
          ? "0 items"
          : `${start}-${end} of ${totalItems} items`}
      </span>

      {/* prev */}
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        className="px-2 disabled:opacity-40 cursor-pointer"
      >
        ‹
      </button>

      {/* page number */}
      <span className="border border-blue-500 text-blue-600 px-3 py-1 rounded">
        {currentPage} / {totalPages}
      </span>

      {/* next */}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        className="px-2 disabled:opacity-40 cursor-pointer"
      >
        ›
      </button>

      {/* page size */}
      <select
        value={pageSize}
        onChange={(e) => {
          setPageSize(Number(e.target.value));
          setCurrentPage(1);
        }}
        className="border rounded px-2 py-1"
      >
        <option value={10}>10 / page</option>
        <option value={20}>20 / page</option>
        <option value={50}>50 / page</option>
      </select>
    </div>
  );
};
