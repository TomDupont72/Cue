import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";

type PaginatorProps = {
  currentPage: number;
  pageNumber: number;
  setCurrentPage: (page: number) => void;
};

export default function Paginator({ currentPage, pageNumber, setCurrentPage }: PaginatorProps) {
  return (
    <Pagination className="pb-3 flex justify-center">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink isActive={currentPage == 1} onClick={() => setCurrentPage(1)}>
            1
          </PaginationLink>
        </PaginationItem>
        {currentPage > 3 ? (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        ) : null}
        {currentPage > 2 ? (
          <PaginationItem>
            <PaginationLink onClick={() => setCurrentPage(currentPage - 1)}>
              {currentPage - 1}
            </PaginationLink>
          </PaginationItem>
        ) : null}
        {currentPage > 1 && currentPage < pageNumber ? (
          <PaginationItem>
            <PaginationLink isActive>{currentPage}</PaginationLink>
          </PaginationItem>
        ) : null}
        {currentPage < pageNumber - 1 ? (
          <PaginationItem>
            <PaginationLink onClick={() => setCurrentPage(currentPage + 1)}>
              {currentPage + 1}
            </PaginationLink>
          </PaginationItem>
        ) : null}
        {currentPage < pageNumber - 2 ? (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        ) : null}
        {pageNumber > 1 ? (
          <PaginationItem>
            <PaginationLink
              isActive={currentPage === pageNumber}
              onClick={() => setCurrentPage(pageNumber)}
            >
              {pageNumber}
            </PaginationLink>
          </PaginationItem>
        ) : null}
        <PaginationItem>
          <PaginationNext onClick={() => setCurrentPage(Math.min(currentPage + 1, pageNumber))} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
