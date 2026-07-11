import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';
import journalRouter from './routes/journal.js';
import assessmentRouter from './routes/assessment.js';
import breathingRouter from './routes/breathing.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'tide-backend' }));

app.use('/api/chat', chatRouter);
app.use('/api/journal', journalRouter);
app.use('/api/assessment', assessmentRouter);
app.use('/api/breathing', breathingRouter);

app.listen(PORT, () => {
  console.log(`潮汐 Tide 后端已启动: http://localhost:${PORT}`);
});
