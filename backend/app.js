const express = require("express");
const app = express();
const cors = require("cors");

require("dotenv").config();
app.use(cors());
app.use(express.json());

const { swaggerUi, specs } = require("./swagger");
const authRoutes = require("./routes/auth.routes");
const documentRoutes = require("./routes/document.routes");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/api/auth", authRoutes);
app.use("/api/document", documentRoutes);

module.exports = app;
