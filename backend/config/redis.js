const redis = require('redis');
const { logger } = require('../utils/logger');

let redisClient;

/**
 * Setup Redis connection
 */
const setupRedis = async () => {
  try {
    // Create Redis client
    redisClient = redis.createClient({
      url: `redis://${process.env.REDIS_PASSWORD ? `:${process.env.REDIS_PASSWORD}@` : ''}${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    });

    // Redis error handling
    redisClient.on('error', (err) => {
      logger.error(`Redis Error: ${err}`);
    });

    // Redis connection
    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    // Connect to Redis
    await redisClient.connect();
  } catch (error) {
    logger.error(`Error setting up Redis: ${error.message}`);
    // Continue without Redis if it fails
  }
};

/**
 * Get value from Redis cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Cached value or null
 */
const getCache = async (key) => {
  try {
    if (!redisClient?.isOpen) return null;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Redis getCache error: ${error.message}`);
    return null;
  }
};

/**
 * Set value in Redis cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} expiry - Expiry time in seconds
 */
const setCache = async (key, value, expiry = 3600) => {
  try {
    if (!redisClient?.isOpen) return;
    await redisClient.set(key, JSON.stringify(value), { EX: expiry });
  } catch (error) {
    logger.error(`Redis setCache error: ${error.message}`);
  }
};

/**
 * Delete value from Redis cache
 * @param {string} key - Cache key
 */
const deleteCache = async (key) => {
  try {
    if (!redisClient?.isOpen) return;
    await redisClient.del(key);
  } catch (error) {
    logger.error(`Redis deleteCache error: ${error.message}`);
  }
};

/**
 * Close Redis connection
 */
const closeRedis = async () => {
  try {
    if (redisClient?.isOpen) {
      await redisClient.quit();
      logger.info('Redis connection closed');
    }
  } catch (error) {
    logger.error(`Error closing Redis connection: ${error.message}`);
  }
};

module.exports = {
  setupRedis,
  getCache,
  setCache,
  deleteCache,
  closeRedis,
}; 