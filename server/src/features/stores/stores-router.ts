import { Router } from 'express';
import {getOpenStoresController, getStoreByIdController, getStoreByOwnerController, toggleStoreController,} from './stores-controller';
const router = Router();

// Tiendas abiertas
   router.get('/stores', getOpenStoresController);

// Tienda de un dueño. Va ANTES de '/stores/:storeId'; si no, Express tomaría "owner" como un id
   router.get('/stores/owner/:userId', getStoreByOwnerController);

// Una tienda por id
   router.get('/stores/:storeId', getStoreByIdController);

// Abrir o cerrar la tienda
    router.patch('/stores/:storeId/toggle', toggleStoreController);

    export default router;