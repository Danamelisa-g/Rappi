import cors from 'cors';
import express, { Router } from 'express';
import { PORT } from './config/config';
import { errorHandler } from './middlewares/errorMiddleware';
import { initDb } from './db/db';
import authRouter from './features/auth/auth-router';

const app = express();
app.use(cors());
app.use(express.json());

const apiRouter = Router();
app.use('/api', apiRouter);

apiRouter.get('/', (req, res) => {
  res.status(200).send('Hello, world!');
});

apiRouter.use('/', authRouter);

app.use(errorHandler);

app.listen(PORT, async () => {
  await initDb();
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;