import Boom from '@hapi/boom';
import { getOpenStoresRepository, getStoreByIdRepository, getStoreByOwnerIdRepository, toggleStoreOpenRepository,
} from './stores-repo';
import { Store } from './stores-types';

// Lista solo las tiendas abiertas
       export const getOpenStoresService = async (): Promise<Store[]> => {
         return getOpenStoresRepository();
                };

// Trae una tienda, si no existe da error 404
export const getStoreByIdService = async (id: string): Promise<Store> => {
  const store = await getStoreByIdRepository(id);

  if (!store) {
    throw Boom.notFound('Store not found');
  }

  return store;
};

// Trae la tienda de un dueño, si no existe da error 404
export const getStoreByOwnerService = async (userId: string): Promise<Store> => {
  const store = await getStoreByOwnerIdRepository(userId);

  if (!store) {
    throw Boom.notFound('Store not found');
  }

  return store;
};

// Abre o cierra la tienda, solo si el usuario es el dueño
export const toggleStoreService = async (storeId: string, userId: string): Promise<Store> => {
  const store = await getStoreByIdRepository(storeId);

  if (!store) {
    throw Boom.notFound('Store not found');
  }

  // Solo el dueño puede abrir o cerrar su tienda
  if (store.user_owner_id !== userId) {
    throw Boom.forbidden('You are not the owner of this store');
  }

  return toggleStoreOpenRepository(storeId);
};