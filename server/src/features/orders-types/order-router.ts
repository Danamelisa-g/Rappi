import { Router } from 'express';
import {acceptOrderController,createOrderController,getAvailableOrdersController,getOrderByIdController,getOrdersController,releaseOrderController,updatePositionController} from './orders-controller';


const router = Router();router.post('/orders', createOrderController);
router.get('/orders', getOrdersController);
// '/orders/available' va ANTES de '/orders/:orderId'; si no, Express toma "available" como un id
router.get('/orders/available', getAvailableOrdersController);
router.get('/orders/:orderId', getOrderByIdController);
router.patch('/orders/:orderId/accept', acceptOrderController);
router.patch('/orders/:orderId/release', releaseOrderController);
router.patch('/orders/:orderId/position', updatePositionController);


export default router;


