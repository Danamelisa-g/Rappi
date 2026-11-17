import Boom from '@hapi/boom';
import { NextFunction, Request, Response } from 'express';
import { getUserByIdRepository } from '../features/auth/auth-repo';

// Revisa que quien hace la petición tenga uno de los roles permitidos
export const checkRole = (roles: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    // El frontend manda el id del usuario en el header x-user-id
    const userId = req.headers['x-user-id'];

    if (!userId) {
      throw Boom.unauthorized('Missing x-user-id header');
    }

    const user = await getUserByIdRepository(String(userId));

    if (!user) {
      throw Boom.unauthorized('User not found');
    }

    if (!roles.includes(user.role)) {
      throw Boom.forbidden('Your role cannot use this endpoint');
    }

    // Todo bien: sigue al controller
    next();
  };
};
