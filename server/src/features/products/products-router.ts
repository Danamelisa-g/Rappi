import { Router } from 'express';
import { getProductsByStoreController, createProductController, updateProductNameController } from './products-controller';
import { checkRole } from '../../middlewares/roleMiddleware';

const router = Router();

router.get('/stores/:storeId/products', checkRole(['consumer', 'store']), getProductsByStoreController);
router.post('/stores/:storeId/products', checkRole(['store']), createProductController);
router.patch('/stores/:storeId/products/:productId', checkRole(['store']), updateProductNameController);

export default router;
