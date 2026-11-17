import { Pool } from 'pg';

import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from '../config/config';

export const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
});

export const initDb = async () => {

  await pool.query(`CREATE TABLE IF NOT EXISTS public.users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(),name TEXT NOT NULL,
    email TEXT NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL);`);

  await pool.query(`CREATE TABLE IF NOT EXISTS public.stores (id UUID PRIMARY KEY DEFAULT gen_random_uuid(),name TEXT NOT NULL,
      is_open BOOLEAN NOT NULL DEFAULT false,user_owner_id UUID NOT NULL REFERENCES public.users(id));`);

  await pool.query(`CREATE TABLE IF NOT EXISTS public.products (id UUID PRIMARY KEY DEFAULT gen_random_uuid(),name TEXT NOT NULL,
      price INTEGER NOT NULL,store_id UUID NOT NULL REFERENCES public.stores(id));`);

  await pool.query(`CREATE TABLE IF NOT EXISTS public.orders (id UUID PRIMARY KEY DEFAULT gen_random_uuid(),client_id UUID NOT NULL REFERENCES public.users(id),delivery_id UUID REFERENCES public.users(id),
      store_id UUID NOT NULL REFERENCES public.stores(id),status TEXT NOT NULL DEFAULT 'Creado',created_at TIMESTAMP NOT NULL DEFAULT now());`);

  await pool.query(`CREATE TABLE IF NOT EXISTS public.order_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES public.orders(id),product_id UUID NOT NULL REFERENCES public.products(id),quantity INTEGER NOT NULL);`);

  
  await pool.query(`ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'Creado';`);
  await pool.query(`UPDATE public.orders SET status = 'Creado' WHERE status = 'waiting_for_deliver';`);
  await pool.query(`UPDATE public.orders SET status = 'En entrega' WHERE status = 'in_progress';`);
  await pool.query(`UPDATE public.orders SET status = 'Entregado' WHERE status = 'delivered';`);
  await pool.query(`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_position GEOGRAPHY(POINT, 4326);`);
  await pool.query(`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS destination GEOGRAPHY(POINT, 4326);`);

  await pool.query(`UPDATE public.orders SET destination = ST_SetSRID(ST_MakePoint(-76.53, 3.45), 4326) WHERE destination IS NULL;`);
  await pool.query(`ALTER TABLE public.orders ALTER COLUMN destination SET NOT NULL;`);
};
