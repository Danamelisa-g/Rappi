import { pool } from '../../db/db';
import { CreateProductDTO, Product } from './products-type';

//logica para crear un producto en la tienda
export const createProductRepository = async (product: CreateProductDTO): Promise<Product> => {
    const result = await pool.query<Product>(
        'INSERT INTO public.products (name, price, store_id) VALUES ($1, $2, $3) RETURNING *',
        [product.name, product.price, product.store_id],
    );
    return result.rows[0];
};

export const getProductsByStoreIdRepository = async (storeId: string): Promise<Product[]> => {
    const result = await pool.query<Product>(
        'SELECT * FROM public.products WHERE store_id = $1',
        [storeId],
    );
    return result.rows;
};

//logica que trae aun productopor su id
export const getProductByIdRepository = async (id: string): Promise<Product | undefined> => {
    const result = await pool.query<Product>(
        'SELECT * FROM public.products WHERE id = $1',
        [id],
    );
    return result.rows[0];
};

//cambia el nombre del producto
export const updateProductNameRepository = async (id: string, name: string): Promise<Product> => {
    const result = await pool.query<Product>(
        'UPDATE public.products SET name = $2 WHERE id = $1 RETURNING *',
        [id, name],
    );
    return result.rows[0];
};