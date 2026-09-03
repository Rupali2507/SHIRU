// db.js
const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI, {
    maxPoolSize: 10,        // don't hammer a free-tier cluster
    serverSelectionTimeoutMS: 10000,
  });
  isConnected = true;
  console.log('Database connected successfully');
}

mongoose.connection.on('disconnected', () => { isConnected = false; });

module.exports = connectDB;