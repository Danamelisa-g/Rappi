import Boom from '@hapi/boom';
import { Request, Response } from 'express';
import {createProductService,getProductsByStoreIdService,updateProductNameService,} from './product-service';


export const getProductsByStoreController = async (req: Request, res: Response) => {
  const storeId = req.params.storeId;
  const products = await getProductsByStoreIdService(String(storeId));
  res.status(200).json(products);
};


export const createProductController = async (req: Request, res: Response) => {
  const storeId = req.params.storeId;
  const { name, price } = req.body;

  if (!name) {
    throw Boom.badRequest('Name is required');
  }

  // El precio tiene que ser un número mayor a 0
  if (typeof price !== 'number' || price <= 0) {
    throw Boom.badRequest('Price must be a number greater than 0');
  }

  const product = await createProductService({ name, price, store_id: String(storeId) });
  res.status(201).json(product);
};


export const updateProductNameController = async (req: Request, res: Response) => {
  const storeId = req.params.storeId;
  const productId = req.params.productId;
  const { userId, name } = req.body;

  if (!userId) {
    throw Boom.badRequest('User id is required');
  }

  if (!name) {
    throw Boom.badRequest('Name is required');
  }

  const product = await updateProductNameService(String(storeId), String(productId), userId, name);
  res.status(200).json(product);
};