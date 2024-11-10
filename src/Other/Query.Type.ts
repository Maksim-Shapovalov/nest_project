export type QueryType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
};

export type QueryType2 = {
  sortBy: string;
  sortDirection: 'ask' | 'desc';
  pageNumber: number;
  pageSize: number;
};
