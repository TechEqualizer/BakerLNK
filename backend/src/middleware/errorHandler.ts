import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export interface APIError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: APIError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        statusCode = 409;
        message = 'A record with this information already exists';
        break;
      case 'P2025': // Record not found
        statusCode = 404;
        message = 'Record not found';
        break;
      case 'P2003': // Foreign key constraint violation
        statusCode = 400;
        message = 'Invalid reference to related record';
        break;
      default:
        statusCode = 400;
        message = 'Database operation failed';
    }
  }

  // Handle validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`❌ Error ${statusCode}:`, err);
  }

  // Send error response
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const createError = (statusCode: number, message: string): APIError => {
  const error = new Error(message) as APIError;
  error.statusCode = statusCode;
  return error;
};