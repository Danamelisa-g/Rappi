import { pool } from '../../db/db';
import { Order, OrderItem } from './order';

// Crea la orden (el status nace en waiting_for_deliver por el DEFAULT de la tabla)
// Devuelve solo el id de la orden nueva
export const createOrderRepository = async (clientId: string, storeId: string): Promise<string> => {
    const result = await pool.query<{ id: string }>(
        'INSERT INTO public.orders (client_id, store_id) VALUES ($1, $2) RETURNING id',
        [clientId, storeId],
    );
    return result.rows[0].id;
}
// Guarda un producto dentro de una orden
export const createOrderItemRepository = async (orderId: string,productId: string,quantity: number,): Promise<void> => {
          await pool.query(
           'INSERT INTO public.order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)',
              [orderId, productId, quantity],
              );
};
export const getOrderByIdRepository = async (id: string): Promise<Order | undefined> => {
    const result = await pool.query<Order>(
        `SELECT o.*, s.name AS store_name FROM public.orders o JOIN public.stores s ON s.id = o.store_id WHERE o.id = $1`,
    [id],
    );
    return result.rows[0];
};

//trae los productos de una orden
export const getOrderItemsRepository = async (orderId: string): Promise<OrderItem[]> => {
    const result = await pool.query<OrderItem>(
        `SELECT oi.*, p.name AS product_name, p.price FROM public.order_items oi JOIN public.products p ON p.id = oi.product_id WHERE oi.order_id = $1`,
        [orderId],
    );
    return result.rows;
};

//ordenes de los clientes
export const getOrdersByClientIdRepository = async (clientId: string): Promise<Order[]> =>{
    const result = await pool.query<Order>(
    `SELECT o.*, s.name AS store_name FROM public.orders o JOIN public.stores s ON s.id = o.store_id WHERE o.client_id = $1 ORDER BY o.created_at DESC`,
    [clientId],
  );

  return result.rows;
};
// Órdenes de una tienda
export const getOrdersByStoreIdRepository = async (storeId: string): Promise<Order[]> => {
  const result = await pool.query<Order>(
    `SELECT o.*, s.name AS store_name FROM public.orders o JOIN public.stores s ON s.id = o.store_id WHERE o.store_id = $1 ORDER BY o.created_at DESC`,
    [storeId],
  );

  return result.rows;
};

// Órdenes que ha tomado un domiciliario (su historial)
export const getOrdersByDeliveryIdRepository = async (deliveryId: string): Promise<Order[]> => {
  const result = await pool.query<Order>(
    `SELECT o.*, s.name AS store_name FROM public.orders o JOIN public.stores s ON s.id = o.store_id WHERE o.delivery_id = $1 ORDER BY o.created_at DESC`,
    [deliveryId],
  );

  return result.rows;
};

// Órdenes disponibles: esperando domiciliario y sin nadie asignado
export const getAvailableOrdersRepository = async (): Promise<Order[]> => {
  const result = await pool.query<Order>(
    `SELECT o.*, s.name AS store_name FROM public.orders o JOIN public.stores s ON s.id = o.store_id  WHERE o.status = 'waiting_for_deliver' AND o.delivery_id IS NULL ORDER BY o.created_at ASC`,
  );

  return result.rows;
};

// Cambia el domiciliario y el estado de una orden
// Se usa para aceptar 
// y entregar 
export const updateOrderRepository = async (
  orderId: string,
  deliveryId: string | null,
  status: string,
): Promise<void> => {
  await pool.query(
    'UPDATE public.orders SET delivery_id = $2, status = $3 WHERE id = $1',
    [orderId, deliveryId, status],
  );
};
   export const takeOrderRepository = async (orderId:string, deliveryId:string): Promise<boolean> =>{
  const result = await pool.query(
    `UPDATE public.orders
     SET delivery_id = $2, status = 'in_progress'
     WHERE id = $1 AND status = 'waiting_for_deliver' AND delivery_id IS NULL`,
    [orderId, deliveryId],
  );
  return result.rowCount === 1;
};