const dotenv = require('dotenv');
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const userRoutes = require('./routes/userRoutes');
dotenv.config();
const app = express();
app.set('trust proxy', 1);
// Connect to MongoDB
connectDB();
app.use(
cors({
origin: ['https://path-wise-ai-test.vercel.app', 'http://localhost:5173'],
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
credentials: true,
})
);


app.use(
cors({
origin: ['https://path-wise-ai.vercel.app'],
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
credentials: true,
})
);

app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
//routes
app.use('/api/users', userRoutes);
//connection
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});
app.get('/', (req, res) => {
res.send('PathWise Backend API is running 🚀');
});
