import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  code?: string
}

export const errorMiddleware = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Something went wrong'
  const code = err.code || 'INTERNAL_SERVER_ERROR'

  console.error(`[Error] ${code}: ${message}`)

  res.status(statusCode).json({
    error: {
      code,
      message,
    },
  })
}

export const notFoundMiddleware = (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`,
    },
  })
}
