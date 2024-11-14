export type PaginationQueryType = {
  sortBy: string;
  sortDirection: 'desc' | 'asc';
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

export function queryFilterByQuizGame(query: any): PaginationQueryType {
  const defaultFilter: PaginationQueryType = {
    sortBy: 'pairCreatedDate',
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
// export function sortQuizGames(
//   games: any[],
//   sortBy: string,
//   sortDirection: 'asc' | 'desc',
// ) {
//   return games.sort((a, b) => {
//     let comparison = 0;
//
//     // Сравнение по статусу
//     if (a[sortBy] < b[sortBy]) {
//       comparison = -1;
//     } else if (a[sortBy] > b[sortBy]) {
//       comparison = 1;
//     }
//
//     // Если статусы равны, сортируем по pairCreatedDate
//     if (comparison === 0) {
//       const dateA = new Date(a.pairCreatedDate);
//       const dateB = new Date(b.pairCreatedDate);
//       comparison = dateB.getTime() - dateA.getTime(); // Сортировка по убыванию
//     }
//
//     return sortDirection === 'asc' ? comparison : -comparison; // Учитываем направление сортировки
//   });
// }
export function sortQuizGames(
  games: any[],
  sortBy: string,
  sortDirection: 'asc' | 'desc',
) {
  const statusOrder = ['Active', 'Finished', 'PendingSecondPlayer'];

  return games.sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'status') {
      // Сравнение по статусу
      const statusAIndex = statusOrder.indexOf(a[sortBy]);
      const statusBIndex = statusOrder.indexOf(b[sortBy]);

      if (statusAIndex < statusBIndex) {
        comparison = -1;
      } else if (statusAIndex > statusBIndex) {
        comparison = 1;
      }

      // Если статусы равны, сортируем по pairCreatedAt
      if (comparison === 0) {
        const dateA = new Date(a.pairCreatedAt);
        const dateB = new Date(b.pairCreatedAt);
        comparison = dateA.getTime() - dateB.getTime(); // Сортировка по возрастанию
      }
    } else {
      // Сортировка по любому другому полю
      if (a[sortBy] < b[sortBy]) {
        comparison = -1;
      } else if (a[sortBy] > b[sortBy]) {
        comparison = 1;
      }
    }
    return sortDirection === 'asc' ? comparison : -comparison; // Учитываем направление сортировки
  });
}
export type PaginationType<I> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: I[];
};
