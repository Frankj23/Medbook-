import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mountRoutes from "./routes/index.js";
import { FRONTEND_URL, FRONTEND_URL_PROD } from "./config.js";

const app = express();

const allowedOrigins = [
  FRONTEND_URL,
  FRONTEND_URL_PROD,
  "http://localhost:5173",
  "http://localhost:5174",
];

// cors MUST come before helmet so that preflight OPTIONS responses
// include Access-Control-Allow-Credentials: true
app.use(
  cors({
    origin: true, // Allow all origins for development
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Handle preflight OPTIONS requests explicitly
// app.options('*', cors())  // Removed as cors middleware handles preflight

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mountRoutes(app);

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", env: process.env.NODE_ENV || "development" }),
);

app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

export default app;
