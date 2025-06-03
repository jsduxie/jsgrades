import cors from 'cors';
import express from 'express';
import 'dotenv/config';
import authRoutes from './routes/auth.js';
import qualificationRoutes from './routes/qualification.js';
import userRoutes from './routes/user.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/qualification', qualificationRoutes);

app.get('/', (req, res) => {
  res.send('Server is running.');
});

app.listen(PORT, () => {
  //console.log(`Server is running on port ${PORT}`);
});
