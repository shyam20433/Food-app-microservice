import paginationConfig from 'Config/pagination'

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
  }
}

export class PaginationHelper {
  public static format<T>(
    rows: T[],
    total: number,
    page: number = 1,
    limit: number = paginationConfig.defaultLimit
  ): PaginatedResult<T> {
    return {
      data: rows,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total),
      },
    }
  }
}
