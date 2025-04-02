import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`❌ Erreur: ${err.message}`)

  if (!(err instanceof AppError)) {
    err = new AppError('Erreur interne du serveur', 500)
  }

  res.status(err.statusCode).json({
    success: false,
    error: err.message,
  })
}
