import cors from 'cors';
import express, { Router } from 'express';
import { PORT } from './config/config';
import { errorHandler } from './middlewares/errorMiddleware';
import { initDb } from './db/db';
import authRouter from './features/auth/auth-router';
import storesRouter from './features/stores/stores-router';
import productsRouter from './features/products/products-router';
import ordersRouter from './features/orders-types/order-router'
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', ordersRouter);
const apiRouter = Router();
app.use('/api', apiRouter);

apiRouter.get('/', (req, res) => {
  res.status(200).send('Hello, world!');
});
apiRouter.use('/', authRouter);
apiRouter.use('/', storesRouter);
apiRouter.use('/', productsRouter);


app.use(errorHandler);

app.listen(PORT, async () => {
  await initDb();
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;