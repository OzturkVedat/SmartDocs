const app = require("./app");
const mongoose = require("mongoose");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

const MONGO_URI = process.env.MONGO_URI;
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 5000;

const connectWithRetry = async (retries = 0) => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(`MongoDB connection failed (attempt ${retries + 1}/${MAX_RETRIES}):`, err.message);

    if (retries < MAX_RETRIES - 1) {
      console.log(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
      setTimeout(() => connectWithRetry(retries + 1), RETRY_DELAY_MS);
    } else {
      console.error("Max retries reached. Exiting.");
      process.exit(1);
    }
  }
};

connectWithRetry();
