const { Queue } = require('bullmq');
const IORedis = require('ioredis');

// Configure the Redis connection.
// On Render, you'll create a Redis instance and get a connection URL.
const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null
});

// Create a new queue named 'automation-jobs'
const automationQueue = new Queue('automation-jobs', { connection });

module.exports = { automationQueue };