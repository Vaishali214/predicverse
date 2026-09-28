import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'An internal server error occurred. Please try again.';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation error.';
  } else if (err instanceof SyntaxError && 'body' in (err as any)) {
    statusCode = 400;
    message = 'Malformed JSON payload in request.';
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        message = 'A record with this unique value already exists.';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'The requested resource was not found.';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Invalid reference to a related resource.';
        break;
      default:
        statusCode = 400;
        message = 'Database operation failed.';
        break;
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid request parameters for database query.';
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 503;
    message = 'Database service unavailable. Please try again later.';
  }

  // Log detailed error internally for server diagnostics
  console.error(`[Server Error] ${req.method} ${req.url}`, err.message || err);

  res.status(statusCode).json({
    success: false,
    message,
  });
};
