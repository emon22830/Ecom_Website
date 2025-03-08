const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    // Construct MongoDB URI from environment variables and secrets
    const username = process.env.MONGODB_USERNAME;
    const password = process.env.MONGODB_PASSWORD;
    const cluster = process.env.MONGODB_CLUSTER || 'cluster0.mongodb.net';
    const database = process.env.MONGODB_DATABASE || 'campuscart';
    
    // If MONGODB_URI is directly provided, use it
    const uri = process.env.MONGODB_URI || 
      `mongodb+srv://${username}:${password}@${cluster}/${database}?retryWrites=true&w=majority`;
    
    // Connect to MongoDB
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Close MongoDB connection
 */
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error(`Error closing MongoDB connection: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB, closeDB }; 