import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import 'dotenv/config';
import { connectMongoDB } from './db/connectMongoDB.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './middleware/logger.js';
import router from './routes/notesRoutes.js';
import { errors as celebrateErrors } from 'celebrate';

const PORT = process.env.PORT ?? 3000;
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(logger);
app.use(router);
app.use(notFoundHandler);
app.use(celebrateErrors());
app.use(errorHandler);

await connectMongoDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
