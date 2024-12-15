import { QueryTypeToTopPlayers } from '../Other/Query.Type';

export type PaginationQueryType = {
  sortBy: string;
  sortDirection: 'desc' | 'asc';
  pageNumber: number;
  pageSize: number;
};
export type PaginationQueryType2 = {
  sortBy: string[];
  pageNumber: number;
  pageSize: number;
};
export type BlogsPaginationQueryType = PaginationQueryType & {
  searchNameTerm: string;
};
export type UserPaginationQueryType = PaginationQueryType & {
  searchLoginTerm: string;
  searchEmailTerm: string;
};

export function searchLogAndEmailInUsers(
  queryLog: any,
): UserPaginationQueryType {
  const defaultFilter: UserPaginationQueryType = {
    searchEmailTerm: '',
    searchLoginTerm: '',
    ...queryFilter(queryLog),
  };
  if (queryLog.searchEmailTerm) {
    defaultFilter.searchEmailTerm = queryLog.searchEmailTerm;
  }
  if (queryLog.searchLoginTerm) {
    defaultFilter.searchLoginTerm = queryLog.searchLoginTerm;
  }
  return defaultFilter;
}

export function searchNameInBlog(request: any): BlogsPaginationQueryType {
  const defaultFilter: BlogsPaginationQueryType = {
    searchNameTerm: '',
    ...queryFilter(request),
  };

  if (request.searchNameTerm) {
    defaultFilter.searchNameTerm = request.searchNameTerm;
  }

  return defaultFilter;
}

export function queryFilter(query: any): PaginationQueryType {
  const defaultFilter: PaginationQueryType = {
    sortBy: 'createdAt',
    sortDirection: 'desc',
    pageNumber: 1,
    pageSize: 10,
  };

  if (query.sortBy) {
    defaultFilter.sortBy = query.sortBy;
  }
  if (query.sortDirection && query.sortDirection === 'asc') {
    defaultFilter.sortDirection = query.sortDirection;
  }
  if (
    query.pageSize &&
    !isNaN(Number(query.pageSize)) &&
    Number(query.pageSize) > 0
  ) {
    defaultFilter.pageSize = Number(query.pageSize);
  }
  if (
    query.pageNumber &&
    !isNaN(Number(query.pageNumber)) &&
    Number(query.pageNumber) > 0
  ) {
    defaultFilter.pageNumber = Number(query.pageNumber);
  }

  return defaultFilter;
}

interface BaseQueryType {
  sortBy: string | string[];
  pageNumber: number;
  pageSize: number;
}

function handlerQueryFilter<T extends BaseQueryType>(
  defaultFilter: T,
  query: any,
): T {
  if (query.sort) {
    defaultFilter.sortBy = query.sort;
  }
  if ('sortDirection' in defaultFilter) {
    if (query.sortDirection && query.sortDirection === 'asc') {
      defaultFilter.sortDirection = query.sortDirection;
    }
  }
  if (
    query.pageSize &&
    !isNaN(Number(query.pageSize)) &&
    Number(query.pageSize) > 0
  ) {
    defaultFilter.pageSize = Number(query.pageSize);
  }
  if (
    query.pageNumber &&
    !isNaN(Number(query.pageNumber)) &&
    Number(query.pageNumber) > 0
  ) {
    defaultFilter.pageNumber = Number(query.pageNumber);
  }
  return defaultFilter;
}
export function queryFilterByQuizGame(query: any): PaginationQueryType {
  const defaultFilter: PaginationQueryType = {
    sortBy: 'pairCreatedDate',
    sortDirection: 'desc',
    pageNumber: 1,
    pageSize: 10,
  };
  return handlerQueryFilter(defaultFilter, query);
}
export function queryFilterByTopPlayer(
  query: QueryTypeToTopPlayers,
): QueryTypeToTopPlayers {
  const defaultFilter: QueryTypeToTopPlayers = {
    sortBy: ['sumScore desc', 'avgScores desc'],
    pageNumber: 1,
    pageSize: 10,
  };

  return handlerQueryFilter(defaultFilter, query);
}

export type PaginationType<I> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: I[];
};
