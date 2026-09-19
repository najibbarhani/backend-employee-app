const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes"); // <--sebelumnya gak ada
const taskRoutes = require("./routes/taskRoutes"); // <-- Tambahan
const { notFound, errorHandler } = require("./middlewares/errorMiddleware"); // <-- Tambahan untuk error

const app = express();

// Middleware Global
app.use(cors());
app.use(express.json());

// Pendaftaran Rute
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes); // <--sebelumnya gak ada
app.use("/api/v1/tasks", taskRoutes); // <-- Tambahan
// Health Check Endpoint
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "success", message: "API aktif dan siap!" });
});

// Middleware Error (Wajib Paling Bawah)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
