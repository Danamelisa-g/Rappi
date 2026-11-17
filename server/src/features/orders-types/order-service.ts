import Boom from "@hapi/boom";
import { getUserByIdRepository } from "../auth/auth-repo";
import { getStoreByIdRepository } from "../stores/stores-repo";
import { getProductByIdRepository } from "../products/product-repo";
import {checkArrivalRepository,createOrderItemRepository, createOrderRepository,getAvailableOrdersRepository,getOrderByIdRepository,getOrderItemsRepository,getOrdersByClientIdRepository,getOrdersByDeliveryIdRepository,getOrdersByStoreIdRepository,releaseOrderRepository,takeOrderRepository,updateDeliveryPositionRepository,updateOrderStatusRepository,} from "./orders-repo";
import { CreateOrderDTO, LatLng, Order, OrderDetail, OrderStatus, PositionUpdateResult } from "./order";

const ARRIVAL_DISTANCE_METERS = 5;
const checkDeliveryUser = async (userId: string) => {
  const user = await getUserByIdRepository(userId);


  if (!user) {
    throw Boom.notFound('User not found');
  }


  if (user.role !== 'delivery') {
    throw Boom.forbidden('Only delivery users can do this');
  }
};

  export const getOrderDetailService = async (orderId: string): Promise<OrderDetail> => {
     const order = await getOrderByIdRepository(orderId);
      if (!order) {
        throw Boom.notFound('Order not found');
      }

const items = await getOrderItemsRepository(orderId);
    return { ...order, items };};

export const createOrderService = async (data: CreateOrderDTO): Promise<OrderDetail> => {
  const client = await getUserByIdRepository(data.clientId);
    if (!client) {
    throw Boom.notFound('User not found');}
    
    if (client.role !== 'consumer') {
    throw Boom.forbidden('Only consumers can create orders');}


 
  const store = await getStoreByIdRepository(data.storeId);


  if (!store) {
    throw Boom.notFound('Store not found');
  }


  if (!store.is_open) {
    throw Boom.badRequest('The store is closed');
  }



  for (const item of data.items) {
    const product = await getProductByIdRepository(item.productId);


    if (!product) {
      throw Boom.notFound('Product not found');
    }


    if (product.store_id !== data.storeId) {
      throw Boom.badRequest('A product does not belong to this store');
    }
  }

  const orderId = await createOrderRepository(data.clientId, data.storeId, data.destination);


  for (const item of data.items) {
    await createOrderItemRepository(orderId, item.productId, item.quantity);
  }


  return getOrderDetailService(orderId);
};


export const getOrdersByClientService = async (clientId: string): Promise<Order[]> => {
  return getOrdersByClientIdRepository(clientId);
};


export const getOrdersByStoreService = async (storeId: string): Promise<Order[]> => {
  return getOrdersByStoreIdRepository(storeId);
};


export const getOrdersByDeliveryService = async (deliveryId: string): Promise<Order[]> => {
  return getOrdersByDeliveryIdRepository(deliveryId);
};


export const getAvailableOrdersService = async (): Promise<Order[]> => {
  return getAvailableOrdersRepository();
};

export const acceptOrderService = async (orderId: string, deliveryId: string): Promise<OrderDetail> => {
  await checkDeliveryUser(deliveryId);


  const order = await getOrderByIdRepository(orderId);


  if (!order) {
    throw Boom.notFound('Order not found');
  }


  if (order.status !== OrderStatus.CREATED || order.delivery_id !== null) {
    throw Boom.conflict('This order was already taken by another delivery');
  }
  const taken = await takeOrderRepository(orderId, deliveryId);


  if (!taken) {
    throw Boom.conflict('This order was already taken by another delivery');
  }


  return getOrderDetailService(orderId);
};

export const releaseOrderService = async (orderId: string, deliveryId: string): Promise<OrderDetail> => {
  await checkDeliveryUser(deliveryId);


  const order = await getOrderByIdRepository(orderId);


  if (!order) {
    throw Boom.notFound('Order not found');
  }


  if (order.status !== OrderStatus.IN_DELIVERY || order.delivery_id !== deliveryId) {
    throw Boom.forbidden('You cannot release this order');
  }


  await releaseOrderRepository(orderId);


  return getOrderDetailService(orderId);
};

export const updatePositionService = async (
  orderId: string,
  deliveryId: string,
  position: LatLng,
): Promise<PositionUpdateResult> => {
  await checkDeliveryUser(deliveryId);


  const order = await getOrderByIdRepository(orderId);


  if (!order) {
    throw Boom.notFound('Order not found');
  }


  if (order.delivery_id !== deliveryId) {
    throw Boom.forbidden('This order is not assigned to you');
  }


  if (order.status !== OrderStatus.IN_DELIVERY) {
    throw Boom.badRequest(`Order is not in delivery (status: ${order.status})`);
  }


  await updateDeliveryPositionRepository(orderId, position);

  const { arrived, distance } = await checkArrivalRepository(orderId, ARRIVAL_DISTANCE_METERS);

  if (arrived) {
    await updateOrderStatusRepository(orderId, OrderStatus.DELIVERED);
  }


  const updatedOrder = await getOrderDetailService(orderId);
  return { order: updatedOrder, arrived, distanceMeters: distance };
};



