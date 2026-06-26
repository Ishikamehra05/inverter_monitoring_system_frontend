"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 2,
}: PaginationProps) {
  const [inputPage, setInputPage] = useState("");

  const pages = useMemo(() => {
    const start = Math.max(1, currentPage - siblingCount);
    const end = Math.min(totalPages, currentPage + siblingCount);

    const range: number[] = [];
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  }, [currentPage, totalPages, siblingCount]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  return (
    <div
      className="
        flex
        flex-wrap
        items-center
        gap-2
        text-sm
        select-none
      "
    >
      {/* ================= PREVIOUS ================= */}
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="
          p-1.5
          rounded
          border border-(--border)
          bg-(--surface)
          hover:bg-(--surface-hover)
          disabled:opacity-40
          disabled:cursor-not-allowed
          transition
        "
      >
        <ChevronLeft size={16} />
      </button>

      {/* ================= LEFT ELLIPSIS ================= */}
      {currentPage > siblingCount + 1 && (
        <>
          <button
            onClick={() => goToPage(1)}
            className="
              px-3 py-1
              rounded
              border border-(--border)
              bg-(--surface)
              hover:bg-(--surface-hover)
              transition
            "
          >
            1
          </button>
          <span className="px-1 text-(--muted-fg)">…</span>
        </>
      )}

      {/* ================= PAGE NUMBERS ================= */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => goToPage(page)}
          className={`
            px-3 py-1
            rounded
            border
            transition
            ${
              page === currentPage
                ? "bg-(--primary) text-(--primary-fg) border-(--primary)"
                : "bg-(--surface) border-(--border) hover:bg-(--surface-hover)"
            }
          `}
        >
          {page}
        </button>
      ))}

      {/* ================= RIGHT ELLIPSIS ================= */}
      {currentPage < totalPages - siblingCount && (
        <>
          <span className="px-1 text-(--muted-fg)">…</span>
          <button
            onClick={() => goToPage(totalPages)}
            className="
              px-3 py-1
              rounded
              border border-(--border)
              bg-(--surface)
              hover:bg-(--surface-hover)
              transition
            "
          >
            {totalPages}
          </button>
        </>
      )}

      {/* ================= NEXT ================= */}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="
          p-1.5
          rounded
          border border-(--border)
          bg-(--surface)
          hover:bg-(--surface-hover)
          disabled:opacity-40
          disabled:cursor-not-allowed
          transition
        "
      >
        <ChevronRight size={16} />
      </button>

      {/* ================= GO TO SECTION ================= */}
      <div className="flex items-center gap-2 sm:ml-3">
        <span className="text-(--muted-fg)">Go to</span>

        <input
          type="number"
          min={1}
          max={totalPages}
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const page = Number(inputPage);
              if (page >= 1 && page <= totalPages) {
                goToPage(page);
                setInputPage("");
              }
            }
          }}
          className="
            w-16
            h-9
            rounded-md
            border border-(--input)
            bg-(--surface)
            px-2
            text-sm
            focus:outline-none
            focus:border-(--primary)
          "
        />

        <span className="text-(--muted-fg)">Page</span>
      </div>
    </div>
  );
}
