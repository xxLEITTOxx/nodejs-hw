import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import 'dotenv/config';
import { connectMongoDB } from './db/connectMongoDB.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './middleware/logger.js';
import router from './routes/notesRoutes.js';

const app = express();
app.use(helmet());
app.use(cors());
const PORT = process.env.PORT ?? 3000;
app.use(express.json());

app.use(logger);
// app.get('/', (req, res) => {
//   res.status(200).json({ message: 'Hello' });
// });
// app.get('/notes', (req, res) => {
//   res.status(200).json({ message: 'Retrieved all notes' });
// });

// app.get('/notes/:noteId', (req, res) => {
//   const { noteId } = req.params;
//   res.status(200).json({ message: `Retrieved note with ID: ${noteId}` });
// });
app.use(router);

app.use(notFoundHandler);

app.use(errorHandler);

await connectMongoDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
