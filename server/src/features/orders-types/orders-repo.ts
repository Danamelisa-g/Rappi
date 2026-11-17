import { pool } from '../../db/db';
import { LatLng, Order, OrderItem, OrderStatus } from './order';


const ORDER_SELECT = `
  SELECT o.id, o.client_id, o.delivery_id, o.store_id, o.status, o.created_at,s.name AS store_name,json_build_object('lat', ST_Y(o.destination::geometry), 'lng', ST_X(o.destination::geometry)) AS destination,
  CASE WHEN o.delivery_position IS NULL THEN NULL ELSE json_build_object('lat', ST_Y(o.delivery_position::geometry), 'lng', ST_X(o.delivery_position::geometry))END AS delivery_position
  FROM public.orders o JOIN public.stores s ON s.id = o.store_id
`;

export const createOrderRepository = async (clientId: string, storeId: string, destination: LatLng): Promise<string> => {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO public.orders (client_id, store_id, status, destination)
     VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326))
     RETURNING id`,
    [clientId, storeId, OrderStatus.CREATED, destination.lng, destination.lat],
  );
  return result.rows[0].id;
};



export const createOrderItemRepository = async (orderId: string, productId: string, quantity: number): Promise<void> => {
  await pool.query(
    'INSERT INTO public.order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)',
    [orderId, productId, quantity],
  );
};


export const getOrderByIdRepository = async (id: string): Promise<Order | undefined> => {
  const result = await pool.query<Order>(`${ORDER_SELECT} WHERE o.id = $1`, [id]);
  return result.rows[0];
};



export const getOrderItemsRepository = async (orderId: string): Promise<OrderItem[]> => {
  const result = await pool.query<OrderItem>(
    `SELECT oi.*, p.name AS product_name, p.price
     FROM public.order_items oi
     JOIN public.products p ON p.id = oi.product_id
     WHERE oi.order_id = $1`,
    [orderId],
  );
  return result.rows;
};



export const getOrdersByClientIdRepository = async (clientId: string): Promise<Order[]> => {
  const result = await pool.query<Order>(`${ORDER_SELECT} WHERE o.client_id = $1 ORDER BY o.created_at DESC`, [clientId]);
  return result.rows;
};



export const getOrdersByStoreIdRepository = async (storeId: string): Promise<Order[]> => {
  const result = await pool.query<Order>(`${ORDER_SELECT} WHERE o.store_id = $1 ORDER BY o.created_at DESC`, [storeId]);
  return result.rows;
};

export const getOrdersByDeliveryIdRepository = async (deliveryId: string): Promise<Order[]> => {
  const result = await pool.query<Order>(`${ORDER_SELECT} WHERE o.delivery_id = $1 ORDER BY o.created_at DESC`, [deliveryId]);
  return result.rows;
};

export const getAvailableOrdersRepository = async (): Promise<Order[]> => {
  const result = await pool.query<Order>(
    `${ORDER_SELECT} WHERE o.status = $1 AND o.delivery_id IS NULL ORDER BY o.created_at ASC`,
    [OrderStatus.CREATED],
  );
  return result.rows;
};

const START_OFFSET = 0.001;
export const takeOrderRepository = async (orderId: string, deliveryId: string): Promise<boolean> => {
  const result = await pool.query(
    `UPDATE public.orders SET delivery_id = $2,status = $3,delivery_position = ST_SetSRID(ST_MakePoint(ST_X(destination::geometry) + $5, ST_Y(destination::geometry) + $5), 4326)
     WHERE id = $1 AND status = $4 AND delivery_id IS NULL`,
    [orderId, deliveryId, OrderStatus.IN_DELIVERY, OrderStatus.CREATED, START_OFFSET],
  );
  return result.rowCount === 1;
};

export const releaseOrderRepository = async (orderId: string): Promise<void> => {
  await pool.query(
    'UPDATE public.orders SET delivery_id = NULL, delivery_position = NULL, status = $2 WHERE id = $1',
    [orderId, OrderStatus.CREATED],
  );
};

export const updateDeliveryPositionRepository = async (orderId: string, position: LatLng): Promise<void> => {
  await pool.query(
    'UPDATE public.orders SET delivery_position = ST_SetSRID(ST_MakePoint($2, $3), 4326) WHERE id = $1',
    [orderId, position.lng, position.lat],
  );
};

export const checkArrivalRepository = async (orderId: string, meters: number) => {
  const result = await pool.query<{ arrived: boolean; distance: number }>(
    `SELECT
       ST_DWithin(delivery_position, destination, $2) AS arrived,
       ST_Distance(delivery_position, destination) AS distance
     FROM public.orders
     WHERE id = $1`,
    [orderId, meters],
  );
  return result.rows[0];
};


export const updateOrderStatusRepository = async (orderId: string, status: OrderStatus): Promise<void> => {
  await pool.query('UPDATE public.orders SET status = $2 WHERE id = $1', [orderId, status]);
};


