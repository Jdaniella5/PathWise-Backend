const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const connectDB = require("./config/db");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// CORS Configuration 
app.use(
  cors({
    origin: ["https://path-wise-ai-test.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type", "Authorization"]
  })
);

// Handle preflight requests explicitly
app.options('*', cors());

app.use(express.json());

// Configure Helmet to allow CORS
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
app.use("/api/users", userRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('PathWise Backend API is running 🚀');
});

// Connection
const PORT = process.env.PORT || 1180;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // Fixed syntax
});
