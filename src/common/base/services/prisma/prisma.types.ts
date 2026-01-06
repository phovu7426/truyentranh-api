export interface PrismaListOptions<TWhere = any, TSelect = any, TInclude = any, TOrderBy = any> {
  page?: number;
  limit?: number;
  sort?: string | string[]; // e.g. "created_at:DESC" | ["id:ASC", "created_at:DESC"]
  orderBy?: TOrderBy | TOrderBy[];
  where?: TWhere;
  select?: TSelect;
  include?: TInclude;
  maxLimit?: number;
}

export interface PrismaListResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage?: number;
    previousPage?: number;
  };
}

