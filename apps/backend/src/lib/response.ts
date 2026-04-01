export function successResponse<T>(data: T) {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }
}

export function paginatedResponse<T>(
  data: T[],
  options?: {
    page?: number
    limit?: number
    total?: number
  }
) {
  return {
    success: true,
    data,
    pagination: {
      page: options?.page ?? 1,
      limit: options?.limit ?? 10,
      total: options?.total ?? data.length,
      totalPages: Math.ceil((options?.total ?? data.length) / (options?.limit ?? 10)),
    },
    timestamp: new Date().toISOString(),
  }
}

export function errorResponse(
  message: string,
  details?: Record<string, string>[],
  code?: string,
) {
  return {
    success: false,
    error: message,
    ...(code ? { code } : {}),
    details,
    timestamp: new Date().toISOString(),
  }
}
