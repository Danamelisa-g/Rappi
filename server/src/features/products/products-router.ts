import { Router}  from 'express';
import { getProductsByStoreController, createProductController, updateProductNameController } from './products-controller';

const router =Router();

router.get('/stores/:storeId/products', getProductsByStoreController);
router.post('/stores/:storeId/products', createProductController);
router.patch('/stores/:storeId/products/:productId', updateProductNameController);

export default router;