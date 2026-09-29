const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


// =========================
// CORS
// =========================

app.use(cors());

// =========================
// MIDDLEWARE
// =========================

app.use(express.json());


// =========================
// DATABASE
// =========================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:",
            error.message
        );
    });


// =========================
// ROUTES
// =========================

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);


// =========================
// ROOT ROUTE
// =========================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "TaskFlow Backend is running!"
    });
});


// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
    console.log(
        `TaskFlow Backend running on port ${PORT}`
    );
});