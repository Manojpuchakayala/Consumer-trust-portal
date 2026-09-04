const mongoose = require("mongoose");
const dns = require("dns");

// Optimize DNS lookup for MongoDB Atlas SRV records
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Fallback to default
}

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      console.error("❌ CRITICAL ERROR: MONGO_URI environment variable is not defined in .env");
      return;
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host} | Database: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.warn("⚠️ Server will remain running. Database operations will retry upon reconnection.");
  }
};

// Event Listeners for Safe Connection Monitoring
mongoose.connection.on("connected", () => {
  console.log("🔗 MongoDB Connection established successfully");
});

mongoose.connection.on("error", (err) => {
  console.error("⚠️ MongoDB Connection runtime error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB Disconnected. Attempting to reconnect...");
});

// Safe Process Termination
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🔒 MongoDB connection closed due to application termination");
  process.exit(0);
});

module.exports = connectDB;
