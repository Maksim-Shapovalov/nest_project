export type QueryType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
};

export type QueryTypeToQuizGame = {
  sortBy: string;
  sortDirection: 'ask' | 'desc';
  pageNumber: number;
  pageSize: number;
};

export type QueryTypeToTopPlayers = {
  sortBy: string[];
  pageNumber: number;
  pageSize: number;
};
