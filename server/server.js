import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import aiRouter from "./routes/aiRoutes.js";
import userRouter from "./routes/userRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";

const app = express();

// Trust the first proxy (Vercel) — required for express-rate-limit
// to correctly read client IP from X-Forwarded-For header
app.set("trust proxy", 1);

await connectCloudinary();

// ── CORS: only allow requests from your frontend origin ──
const allowedOrigins = [
  process.env.CLIENT_URL, // e.g. "http://localhost:5173" or your production domain
  "http://localhost:5173",
  "https://devxaiclient.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(clerkMiddleware());

// ── General rate limiter for all API routes ──
app.use("/api", apiLimiter);

// ── Public health check route ──
app.get("/", (req, res) => res.send("Server is live"));

// ── Protected routes (require authentication) ──
app.use(requireAuth());
app.use("/api/ai", aiRouter);
app.use("/api/user", userRouter);

// ── Global error handler (must be LAST middleware) ──
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
