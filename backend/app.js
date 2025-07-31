const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
app.use(cors());
app.use(express.json());

const documentRoutes = require("./routes/document.routes");
app.use("/api/document", documentRoutes);

module.exports = app;
