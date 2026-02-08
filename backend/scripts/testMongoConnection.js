const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config({ path: require("path").resolve(__dirname, "..", ".env") });

const uri = process.env.MONGODB_URI;

async function run() {
  if (!uri) {
    console.error("MONGODB_URI not set in .env");
    process.exit(2);
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

  try {
    console.log("Attempting to connect to MongoDB...");
    await client.connect();
    const admin = client.db().admin();
    const info = await admin.serverStatus();
    console.log("MongoDB connection successful");
    console.log("Version:", info.version);
    process.exit(0);
  } catch (err) {
    console.error("MongoDB connection failed:");
    console.error(err && err.message ? err.message : err);
    process.exit(3);
  } finally {
    try {
      await client.close();
    } catch {}
  }
}

run();
