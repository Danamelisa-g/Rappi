import { Router } from 'express';
import { getOpenStoresController, getStoreByIdController, getStoreByOwnerController, toggleStoreController } from './stores-controller';
import { checkRole } from '../../middlewares/roleMiddleware';

const router = Router();

// Tiendas abiertas (solo el cliente)
router.get('/stores', checkRole(['consumer']), getOpenStoresController);

// Tienda de un dueño. Va ANTES de '/stores/:storeId'; si no, Express tomaría "owner" como un id
router.get('/stores/owner/:userId', checkRole(['store']), getStoreByOwnerController);

// Una tienda por id
router.get('/stores/:storeId', checkRole(['consumer', 'store']), getStoreByIdController);

// Abrir o cerrar la tienda
router.patch('/stores/:storeId/toggle', checkRole(['store']), toggleStoreController);

export default router;
