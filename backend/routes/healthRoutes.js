const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', (req, res) => {
  const healthcheck = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    memory: process.memoryUsage(),
    cpu: process.cpuUsage()
  };
  
  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.status = 'error';
    healthcheck.message = error.message;
    res.status(503).json(healthcheck);
  }
});

/**
 * @route   GET /api/health/deep
 * @desc    Deep health check endpoint (checks database connection)
 * @access  Public
 */
router.get('/deep', async (req, res) => {
  const healthcheck = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'unknown',
      redis: 'unknown'
    }
  };
  
  try {
    // Check database connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      healthcheck.services.database = 'connected';
    } else {
      healthcheck.services.database = 'disconnected';
      healthcheck.status = 'warning';
    }
    
    // Check Redis connection if available
    if (process.env.REDIS_HOST) {
      try {
        const redis = require('redis');
        const client = redis.createClient({
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT || 6379
        });
        
        await new Promise((resolve, reject) => {
          client.ping((err, result) => {
            if (err) {
              healthcheck.services.redis = 'disconnected';
              healthcheck.status = 'warning';
              reject(err);
            } else {
              healthcheck.services.redis = 'connected';
              resolve();
            }
            client.quit();
          });
        });
      } catch (error) {
        healthcheck.services.redis = 'disconnected';
        healthcheck.status = 'warning';
      }
    }
    
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.status = 'error';
    healthcheck.message = error.message;
    res.status(503).json(healthcheck);
  }
});

module.exports = router; 