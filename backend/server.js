const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const codeRoutes = require("./routes/codeRoutes");

const authRoutes = require("./routes/authRoutes");

const projectRoutes = require("./routes/projectRoutes"); 

const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/code" , codeRoutes);

app.use("/api/auth",authRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
    res.send("CodeBlueprint AI Backend is running!");
});

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});