import Boom from '@hapi/boom';
import { Request, Response } from 'express';
import {getOpenStoresService, getStoreByIdService, getStoreByOwnerService, toggleStoreService,} from './stores-service';

// GET /stores
export const getOpenStoresController = async (req: Request, res: Response) => {
  const stores = await getOpenStoresService();
  res.status(200).json(stores);
};

// GET /stores/:storeId
export const getStoreByIdController = async (req: Request, res: Response) => {
  const storeId = req.params.storeId;
  const store = await getStoreByIdService(String(storeId));
  res.status(200).json(store);
};

// GET /stores/owner/:userId
export const getStoreByOwnerController = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const store = await getStoreByOwnerService(String(userId));
  res.status(200).json(store);
};

// PATCH /stores/:storeId/toggle
export const toggleStoreController = async (req: Request, res: Response) => {
  const storeId = req.params.storeId;
  const { userId } = req.body;

  if (!userId) {
    throw Boom.badRequest('User id is required');
  }

  const store = await toggleStoreService(String(storeId), userId);
  res.status(200).json(store);
};