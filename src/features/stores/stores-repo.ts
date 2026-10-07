import { pool } from '../../db/db';
import { CreateStoreDTO, Store } from './stores-types';

// Crea una tienda (nace cerrada porque is_open tiene DEFAULT false)
 export const createStoreRepository = async (store: CreateStoreDTO): Promise<Store> => {
  const result = await pool.query<Store>(
    'INSERT INTO public.stores (name, user_owner_id) VALUES ($1, $2) RETURNING *',
    [store.name, store.userOwnerId],
  );

  return result.rows[0];
};

// Trae solo las tiendas abiertas
 export const getOpenStoresRepository = async (): Promise<Store[]> => {
  const result = await pool.query<Store>('SELECT * FROM public.stores WHERE is_open = true');

  return result.rows;
};

// Trae una tienda por su id
     export const getStoreByIdRepository = async (id: string): Promise<Store | undefined> => {
  const result = await pool.query<Store>('SELECT * FROM public.stores WHERE id = $1', [id]);

  return result.rows[0];
};

// Trae la tienda de un dueño (el usuario con rol store)
   export const getStoreByOwnerIdRepository = async (userId: string): Promise<Store | undefined> => {
  const result = await pool.query<Store>(
    'SELECT * FROM public.stores WHERE user_owner_id = $1',
    [userId],
  );

  return result.rows[0];
};

// Abre o cierra la tienda: NOT invierte el valor (true pasa a false y viceversa)
   export const toggleStoreOpenRepository = async (id: string): Promise<Store> => {
  const result = await pool.query<Store>(
    'UPDATE public.stores SET is_open = NOT is_open WHERE id = $1 RETURNING *',
    [id],
  );

  return result.rows[0];
   };