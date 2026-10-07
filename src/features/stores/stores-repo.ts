import { pool } from '../../db/db';
import { Store, CreateStoreDTO } from './stores-types';

export const createStoreRepository = async (store: CreateStoreDTO): Promise<Store> =>{
    const result = await pool.query<Store>(
        `INSERT INTO public.stores (name, user_owner_id)
     VALUES ($1, $2)
     RETURNING id, name, is_open AS "isOpen", user_owner_id AS "userOwnerId"`,
        [store.name, store.userOwnerId]
    );
    return result.rows[0];
};