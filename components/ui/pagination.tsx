import * as React from "react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

interface PaginationProps {
  className?: string
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
}

function Pagination({ className, currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = React.useMemo(() => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
    >
      <ul data-slot="pagination-content" className="flex items-center gap-0.5">
        <li data-slot="pagination-item">
          <Button
            variant={currentPage === 1 ? "outline" : "ghost"}
            size="icon"
            className="pl-1.5"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            <ChevronLeftIcon data-icon="inline-start" />
          </Button>
        </li>
        
        {pages.map((page, index) => (
          <li key={index} data-slot="pagination-item">
            {page === "..." ? (
              <span
                aria-hidden
                data-slot="pagination-ellipsis"
                className="flex size-8 items-center justify-center"
              >
                <MoreHorizontalIcon />
                <span className="sr-only">More pages</span>
              </span>
            ) : (
              <Button
                asChild
                variant={page === currentPage ? "outline" : "ghost"}
                size="icon"
                onClick={() => onPageChange(page as number)}
                aria-current={page === currentPage ? "page" : undefined}
              >
                <a
                  data-slot="pagination-link"
                  data-active={page === currentPage}
                >
                  {page}
                </a>
              </Button>
            )}
          </li>
        ))}
        
        <li data-slot="pagination-item">
          <Button
            variant={currentPage === totalPages ? "outline" : "ghost"}
            size="icon"
            className="pr-1.5"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
        </li>
      </ul>
    </nav>
  )
}

export { Pagination }