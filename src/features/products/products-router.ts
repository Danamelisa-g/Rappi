import { Router}  from 'express';
import { getProductsByStoreController, createProductController, updateProductNameController } from './products-controller';

const router =Router();

router.get('/stores/:storesId/products', getProductsByStoreController);
router.post('/stores/:storesId/products', createProductController);
router.patch('/stores/:storesId/products/:productId', updateProductNameController);

export default router;