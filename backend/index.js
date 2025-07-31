const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const cors = require("cors");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 3000;

dotenv.config();

// ✅ CORS configuration cho port 5173
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(logger("dev"));
app.use(cookieParser());

// Kết nối database
require("./config/database").connect();

// Route test
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend server is alive!",
    port: port,
    corsOrigin: 'http://localhost:5173'
  });
});

// Sử dụng routes
require("./routes/indexRoute")(app);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`CORS enabled for: http://localhost:5173`);
});