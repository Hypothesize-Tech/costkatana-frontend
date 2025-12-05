import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { cn } from "@/utils/helpers";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) => {
  const pages = generatePaginationArray(currentPage, totalPages);

  return (
    <nav
      className={cn("flex items-center justify-between py-4", className)}
      aria-label="Pagination"
    >
      <div className="flex flex-1 justify-between sm:hidden gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex-1 btn btn-secondary font-display font-medium text-sm px-4 py-2"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex-1 btn btn-secondary font-display font-medium text-sm px-4 py-2"
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between sm:gap-4">
        <div className="flex-shrink-0">
          <p className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary whitespace-nowrap">
            Page <span className="font-display font-semibold gradient-text">{currentPage}</span> of{" "}
            <span className="font-display font-semibold gradient-text">{totalPages}</span>
          </p>
        </div>

        <div className="flex-shrink-0 overflow-x-auto">
          <nav
            className="isolate inline-flex -space-x-px rounded-xl shadow-lg glass backdrop-blur-xl border border-primary-200/30"
            aria-label="Pagination"
          >
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn relative inline-flex items-center rounded-l-xl px-2 py-2 sm:px-3 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 hover:bg-primary-500/10 focus:z-20 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
            </button>

            {pages.map((page, index) => (
              <PageButton
                key={index}
                page={page}
                currentPage={currentPage}
                onClick={onPageChange}
              />
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn relative inline-flex items-center rounded-r-xl px-2 py-2 sm:px-3 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 hover:bg-primary-500/10 focus:z-20 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110"
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </nav>
  );
};

interface PageButtonProps {
  page: number | "...";
  currentPage: number;
  onClick: (page: number) => void;
}

const PageButton = ({ page, currentPage, onClick }: PageButtonProps) => {
  if (page === "...") {
    return (
      <span className="relative inline-flex items-center px-4 py-2 text-sm font-display font-semibold text-light-text-muted dark:text-dark-text-muted">
        ...
      </span>
    );
  }

  const isActive = page === currentPage;

  return (
    <button
      onClick={() => onClick(page)}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative inline-flex items-center px-2 py-2 sm:px-4 text-xs sm:text-sm font-display font-semibold focus:z-20 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300",
        isActive
          ? "z-10 bg-gradient-primary text-white shadow-lg glow-primary"
          : "text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 hover:bg-primary-500/10 hover:scale-105",
      )}
    >
      {page}
    </button>
  );
};

// Helper function to generate pagination array
function generatePaginationArray(
  currentPage: number,
  totalPages: number,
): (number | "...")[] {
  const delta = 2;
  const range: number[] = [];
  const rangeWithDots: (number | "...")[] = [];
  let l: number;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    }
  }

  range.forEach((i) => {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  });

  return rangeWithDots;
}
