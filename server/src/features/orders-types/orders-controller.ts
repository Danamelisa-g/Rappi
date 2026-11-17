import Boom from '@hapi/boom';
import { Request, Response } from 'express';
import {acceptOrderService,createOrderService,getAvailableOrdersService,getOrderDetailService,getOrdersByClientService,getOrdersByDeliveryService,getOrdersByStoreService,releaseOrderService,updatePositionService,} from './order-service';
import { LatLng } from './order';


const parseLatLng = (value: unknown, fieldName: string): LatLng => {
  const point = value as Partial<LatLng> | undefined;
  const lat = Number(point?.lat);
  const lng = Number(point?.lng);


  if (point?.lat === undefined || point?.lng === undefined || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw Boom.badRequest(`${fieldName} must be an object { lat, lng } with numbers`);
  }


  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw Boom.badRequest(`${fieldName} is out of range`);
  }


  return { lat, lng };
};

export const createOrderController = async (req: Request, res: Response) => {
  const { clientId, storeId, items } = req.body;


  if (!clientId) {
    throw Boom.badRequest('Client id is required');
  }


  if (!storeId) {
    throw Boom.badRequest('Store id is required');
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw Boom.badRequest('Items are required');
  }

  for (const item of items) {
    if (!item.productId) {
      throw Boom.badRequest('Product id is required in every item');
    }


    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw Boom.badRequest('Quantity must be an integer greater than 0');
    }
  }

  const destination = parseLatLng(req.body.destination, 'destination');


  const order = await createOrderService({ clientId, storeId, items, destination });
  res.status(201).json(order);
};


export const getOrdersController = async (req: Request, res: Response) => {
  const { clientId, storeId, deliveryId } = req.query;


  if (clientId) {
    const orders = await getOrdersByClientService(String(clientId));
    res.status(200).json(orders);
    return;
  }


  if (storeId) {
    const orders = await getOrdersByStoreService(String(storeId));
    res.status(200).json(orders);
    return;
  }


  if (deliveryId) {
    const orders = await getOrdersByDeliveryService(String(deliveryId));
    res.status(200).json(orders);
    return;
  }


  throw Boom.badRequest('clientId, storeId or deliveryId is required');
};


export const getAvailableOrdersController = async (req: Request, res: Response) => {
  const orders = await getAvailableOrdersService();
  res.status(200).json(orders);
};

export const getOrderByIdController = async (req: Request, res: Response) => {
  const orderId = req.params.orderId;
  const order = await getOrderDetailService(String(orderId));
  res.status(200).json(order);
};

export const acceptOrderController = async (req: Request, res: Response) => {
  const orderId = req.params.orderId;
  const { deliveryId } = req.body;


  if (!deliveryId) {
    throw Boom.badRequest('Delivery id is required');
  }


  const order = await acceptOrderService(String(orderId), deliveryId);
  res.status(200).json(order);
};

export const releaseOrderController = async (req: Request, res: Response) => {
  const orderId = req.params.orderId;
  const { deliveryId } = req.body;


  if (!deliveryId) {
    throw Boom.badRequest('Delivery id is required');
  }


  const order = await releaseOrderService(String(orderId), deliveryId);
  res.status(200).json(order);
};

export const updatePositionController = async (req: Request, res: Response) => {
  const orderId = req.params.orderId;
  const { deliveryId, lat, lng } = req.body;


  if (!deliveryId) {
    throw Boom.badRequest('Delivery id is required');
  }


  const position = parseLatLng({ lat, lng }, 'position');


  const result = await updatePositionService(String(orderId), deliveryId, position);
  res.status(200).json(result);
};


