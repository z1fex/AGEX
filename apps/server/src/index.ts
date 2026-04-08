import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { agentsRouter } from "./routes/agents.js";
import { workflowsRouter } from "./routes/workflows.js";
import { vaultRouter } from "./routes/vault.js";
import { healthRouter } from "./routes/health.js";

const app = new Hono();

// --- Middleware ---
app.use("*", logger());
app.use(
  "/api/*",
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
  })
);

// --- Routes ---
app.route("/api/v1/health", healthRouter);
app.route("/api/v1/agents", agentsRouter);
app.route("/api/v1/workflows", workflowsRouter);
app.route("/api/v1/vault", vaultRouter);

// --- Root ---
app.get("/", (c) =>
  c.json({
    name: "Agency in a Box API",
    version: "3.0.0",
    status: "running",
  })
);

// --- Start ---
const port = parseInt(process.env.API_PORT || "4001");
console.log(`🚀 Agency API running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });

export default app;
