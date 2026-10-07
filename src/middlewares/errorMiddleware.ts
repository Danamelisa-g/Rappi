import { Request, Response, NextFunction } from 'express';
import Boom from '@hapi/boom';

export const errorHandler = (
  err: Error | Boom.Boom,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const boomError: Boom.Boom = Boom.isBoom(err)
    ? err
    : Boom.boomify(err);

  const { statusCode, payload } = boomError.output;
  res.status(statusCode).json({
    ...payload,
    details: boomError.message,
  });
};