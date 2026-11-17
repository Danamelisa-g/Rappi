import { Router } from 'express';
import { acceptOrderController, createOrderController, getAvailableOrdersController, getOrderByIdController, getOrdersController, releaseOrderController, updatePositionController } from './orders-controller';
import { checkRole } from '../../middlewares/roleMiddleware';

const router = Router();

router.post('/orders', checkRole(['consumer']), createOrderController);
router.get('/orders', checkRole(['consumer', 'store', 'delivery']), getOrdersController);
// '/orders/available' va ANTES de '/orders/:orderId'; si no, Express toma "available" como un id
router.get('/orders/available', checkRole(['delivery']), getAvailableOrdersController);
router.get('/orders/:orderId', checkRole(['consumer', 'store', 'delivery']), getOrderByIdController);
router.patch('/orders/:orderId/accept', checkRole(['delivery']), acceptOrderController);
router.patch('/orders/:orderId/release', checkRole(['delivery']), releaseOrderController);
router.patch('/orders/:orderId/position', checkRole(['delivery']), updatePositionController);

export default router;
