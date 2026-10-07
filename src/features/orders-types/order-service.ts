import Boom from "@hapi/boom";
import { getUserByIdRepository } from "../auth/auth-repo";
import { getStoreByIdRepository } from "../stores/stores-repo";
import { getProductByIdRepository } from "../products/product-repo";
import { createOrderItemRepository, createOrderRepository, getAvailableOrdersRepository, getOrderByIdRepository,getOrderItemsRepository,getOrdersByClientIdRepository,getOrdersByDeliveryIdRepository,getOrdersByStoreIdRepository,takeOrderRepository,updateOrderRepository } from "./orders-repo";
import { CreateOrderDTO, Order, OrderDetail } from "./order";

// Revisa que el usuario exista y sea domiciliario
  const checkDeliveryUser = async (userId: string) => {
     const user = await getUserByIdRepository(userId);

      if (!user) {
     throw Boom.notFound('User not found');
  }

     if (user.role !== 'delivery') {
      throw Boom.forbidden('Only delivery users can do this');
  }
};

// Trae una orden con sus productos
    export const getOrderDetailService = async (orderId: string): Promise<OrderDetail> => {
      const order = await getOrderByIdRepository(orderId);

        if (!order) {
        throw Boom.notFound('Order not found');
  }

     const items = await getOrderItemsRepository(orderId);

     return { ...order, items };
};

// Crea una orden
export const createOrderService = async (data: CreateOrderDTO): Promise<OrderDetail> => {
  // 1. El usuario debe existir y ser consumer
     const client = await getUserByIdRepository(data.clientId);

    if (!client) {
    throw Boom.notFound('User not found');
  }

    if (client.role !== 'consumer') {
    throw Boom.forbidden('Only consumers can create orders');
  }

  // 2. La tienda debe existir y estar ABIERTA (validación pedida en el laboratorio)
     const store = await getStoreByIdRepository(data.storeId);

     if (!store) {
      throw Boom.notFound('Store not found');
  }

     if (!store.is_open) {
     throw Boom.badRequest('The store is closed');
  }

  // 3. Todos los productos deben existir y ser de esa tienda
  for (const item of data.items) {
    const product = await getProductByIdRepository(item.productId);

    if (!product) {
      throw Boom.notFound('Product not found');
    }

    if (product.store_id !== data.storeId) {
      throw Boom.badRequest('A product does not belong to this store');
    }
  }

  // 4. Si todo está bien, se guarda la orden y luego sus productos
  const orderId = await createOrderRepository(data.clientId, data.storeId);

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

// El domiciliario acepta una orden
export const acceptOrderService = async (orderId: string, deliveryId: string): Promise<OrderDetail> => {
  await checkDeliveryUser(deliveryId);

  const order = await getOrderByIdRepository(orderId);

  if (!order) {
    throw Boom.notFound('Order not found');
  }

  // Si ya tiene domiciliario o no está esperando, otro la tomó primero
  if (order.status !== 'waiting_for_deliver' || (order as Order & { orderdelivery_id: string | null }).delivery_id !== null) {
    throw Boom.conflict('This order was already taken by another delivery');
  }

  await updateOrderRepository(orderId, deliveryId, 'in_progress');

  return getOrderDetailService(orderId);
};

// El domiciliario suelta la orden y vuelve a waiting_for_deliver
export const releaseOrderService = async (orderId: string, deliveryId: string): Promise<OrderDetail> => {
  await checkDeliveryUser(deliveryId);

  const order = await getOrderByIdRepository(orderId);

  if (!order) {
    throw Boom.notFound('Order not found');
  }

  // Solo puede soltarla quien la tiene y mientras está en progreso
  if (order.status !== 'in_progress' || (order as Order & { delivery_id: string | null }).delivery_id !== deliveryId) {
    throw Boom.forbidden('You cannot release this order');
  }

  await updateOrderRepository(orderId, null, 'waiting_for_deliver');

  return getOrderDetailService(orderId);
};

// El domiciliario marca la orden como entregada
export const deliverOrderService = async (orderId: string, deliveryId: string): Promise<OrderDetail> => {
  await checkDeliveryUser(deliveryId);

  const order = await getOrderByIdRepository(orderId);

  if (!order) {
    throw Boom.notFound('Order not found');
  }

  // Solo puede entregarla quien la tiene y mientras está en progreso
  if (order.status !== 'in_progress' || (order as Order & { delivery_id: string | null }).delivery_id !== deliveryId) {
    throw Boom.forbidden('You cannot deliver this order');
  }

  await updateOrderRepository(orderId, deliveryId, 'delivered');

  return getOrderDetailService(orderId);
};
