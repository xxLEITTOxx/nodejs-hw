import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pino from 'pino-http';
import 'dotenv/config';

const app = express();
app.use(helmet());
app.use(cors());
const PORT = process.env.PORT ?? 3000;
app.use(express.json());

app.use(
  pino({
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        messageFormat:
          '{req.method} {req.url} {res.statusCode} - {responseTime}ms',
        hideObject: true,
      },
    },
  }),
);
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello' });
});
app.get('/notes', (req, res) => {
  res.status(200).json({ message: 'Retrieved all notes' });
});
app.get('/test-error', () => {
  throw new Error('Simulated server error');
});
app.get('/notes/:noteId', (req, res) => {
  const { noteId } = req.params;
  res.status(200).json({ message: `Retrieved note with ID: ${noteId}` });
});
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});
app.use((err, req, res, next) => {
  console.error(`Error:`, err.message);
  res
    .status(500)
    .json({ message: 'Internal Server Error', error: err.message });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
