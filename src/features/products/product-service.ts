import Boom from '@hapi/boom';
import { getStoreByIdRepository } from '../stores/stores-repo';
import { createProductRepository, getProductByIdRepository, getProductsByStoreIdRepository, updateProductNameRepository } from './product-repo';
import { CreateProductDTO, Product } from './products-type';

// Lista de productos y revisa si existe
export const getProductsByStoreIdService = async (storeId: string): Promise<Product[]> => {
  const store = await getStoreByIdRepository(storeId);

  if (!store) {
    throw Boom.notFound('Store not found');
  }

  return getProductsByStoreIdRepository(storeId);
};
//crear un producto (la tienda debe de existgir)
export const createProductService = async (product: CreateProductDTO): Promise<Product> => {
    const store = await getStoreByIdRepository(product.store_id);

    if (!store) {
        throw Boom.notFound('Store not found');
    }

    return createProductRepository(product);
};

//cambia el nombre de un productosolo ei el user de
export const updateProductNameService = async (
    storeId: string,productId: string, userId: string, name: string,
): Promise<Product> => {
    const store = await getStoreByIdRepository(storeId);

    if (!store) {
        throw Boom.notFound('Store not found');
    }
    //solo el puede cambirarloi
    if (store.user_owner_id !== userId) {
        throw Boom.forbidden('You are not the owner of this store');

    }
    const product = await getProductByIdRepository(productId);

    if (!product) {
        throw Boom.notFound('Product not found');
    }
    //el producto debe de sr de esa tienda
    if (product.store_id !== storeId) {
        throw Boom.forbidden('Product does not belong to this store');
    }

    return updateProductNameRepository(productId, name);
};
