import Boom from '@hapi/boom';
import { Request, Response } from 'express';
import { acceptOrderService, createOrderService, deliverOrderService, getAvailableOrdersService, getOrderDetailService, getOrdersByClientService, getOrdersByDeliveryService, getOrdersByStoreService, releaseOrderService,} from './order-service';

// postean las ordenes 
export const createOrderController = async (req: Request, res: Response) => {
  const { clientId, storeId, items } = req.body;

  if (!clientId) {
    throw Boom.badRequest('Client id is required');
  }

  if (!storeId) {
    throw Boom.badRequest('Store id is required');
  }

  // items debe ser una lista con al menos un producto
  if (!Array.isArray(items) || items.length === 0) {
    throw Boom.badRequest('Items are required');
  }

  // Cada item necesita productId y una cantidad entera mayor a 0
  for (const item of items) {
    if (!item.productId) {
      throw Boom.badRequest('Product id is required in every item');
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw Boom.badRequest('Quantity must be an integer greater than 0');
    }
  }

  const order = await createOrderService({ clientId, storeId, items });
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

// 
export const getAvailableOrdersController = async (req: Request, res: Response) => {
  const orders = await getAvailableOrdersService();
  res.status(200).json(orders);
};

// el controlador
export const getOrderByIdController = async (req: Request, res: Response) => {
  const orderId = req.params.orderId;
  const order = await getOrderDetailService(String(orderId));
  res.status(200).json(order);
};

//enpoint para aceptar 
export const acceptOrderController = async (req: Request, res: Response) => {
  const orderId = req.params.orderId;
  const { deliveryId } = req.body;

  if (!deliveryId) {
    throw Boom.badRequest('Delivery id is required');
  }

  const order = await acceptOrderService(String(orderId), deliveryId);
  res.status(200).json(order);
};

// el id de la orden  
export const releaseOrderController = async (req: Request, res: Response) => {
  const orderId = req.params.orderId;
  const { deliveryId } = req.body;

  if (!deliveryId) {
    throw Boom.badRequest('Delivery id is required');
  }

  const order = await releaseOrderService(String(orderId), deliveryId);
  res.status(200).json(order);
};

// pedimos el deliverryyyy 
export const deliverOrderController = async (req: Request, res: Response) => {
  const orderId = req.params.orderId;
  const { deliveryId } = req.body;

  if (!deliveryId) {
    throw Boom.badRequest('Delivery id is required');
  }

  const order = await deliverOrderService(String(orderId), deliveryId);
  res.status(200).json(order);
};