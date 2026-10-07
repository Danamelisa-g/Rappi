import { Router } from 'express'
import { acceptOrderController, createOrderController, deliverOrderController, getAvailableOrdersController, getOrderByIdController, getOrdersController, releaseOrderController } from './orders-controller'
const router = Router();

router.post('/orders', createOrderController);
router.get('/orders', getOrdersController);
router.get('/orders/:orderId', getOrderByIdController);
router.patch('/orders/:orderId/accept', acceptOrderController);
router.patch('/orders/:orderId/release', releaseOrderController);
router.patch('/orders/:orderId/deliver', deliverOrderController);
router.get('/orders/available', getAvailableOrdersController);

export default router;