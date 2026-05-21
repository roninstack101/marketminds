const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const transactionRoutes = require("./routes/transaction.routes");
const adminRoutes = require("./routes/admin.routes");
const planRoutes = require("./routes/plan.routes");
const purchaseRoutes = require("./routes/purchase.routes");
const { getSettings } = require("./controllers/settings.controller");
const { getComputedGains } = require("./controllers/dashboard.controller");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*", credentials: true }));
app.use(express.json({ limit: "5mb" }));

// Global rate limit — 100 requests per 15 min per IP
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));

const { protect } = require("./middleware/auth.middleware");

app.use("/api/auth",         authRoutes);
app.use("/api/user",         userRoutes);
app.use("/api/plans",        planRoutes);
app.use("/api/purchases",    purchaseRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin",        adminRoutes);

// Specific sub-routes registered before their parent router
app.get("/api/dashboard/gains", protect, getComputedGains);
app.use("/api/dashboard",    dashboardRoutes);

app.get("/api/settings", protect, getSettings);

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

// 404
app.use((_, res) => res.status(404).json({ success: false, message: "Route not found" }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal server error" });
});

module.exports = app;
