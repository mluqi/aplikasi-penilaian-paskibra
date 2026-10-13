require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const teamRoutes = require("./routes/teamRoutes");
const anggotaTeamRoutes = require("./routes/anggotaTeamRoutes");
const eventRoutes = require("./routes/eventRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const logRoutes = require("./routes/logRoutes");
const roleAccessRoutes = require("./routes/roleAccessRoutes");
const aspekSubAspekRoutes = require("./routes/aspekSubAspekRoutes");
const penilaianRoutes = require("./routes/penilaianRoutes");
const rekapRoutes = require("./routes/rekapRoutes");
const wilayahRoutes = require("./routes/wilayahRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const apiKeyRoutes = require("./routes/apiKeyRoutes");
const penaltyRoutes = require("./routes/penaltyRoutes");
const juriRoutes = require("./routes/juriRoutes");
const { syncSaldo } = require("./cron/syncSaldo");

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Cookie",
      "Set-Cookie",
      "X-CSRF-Token",
    ],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/webhook", webhookRoutes);

app.get("/api", (req, res) => {
  res.status(200).send("OK");
});
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/anggota", anggotaTeamRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/role-access", roleAccessRoutes);
app.use("/api/aspek", aspekSubAspekRoutes);
app.use("/api/penilaian", penilaianRoutes);
app.use("/api/rekap", rekapRoutes);
app.use("/api/wilayah", wilayahRoutes);
app.use("/api/keys", apiKeyRoutes);
app.use("/api/penalties", penaltyRoutes);
app.use("/api/juri", juriRoutes);

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    cron.schedule("0 6 * * *", syncSaldo, {
      timezone: "Asia/Jakarta",
    });

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on PORT ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start the server:", error);
    process.exit(1);
  }
};

startServer();
