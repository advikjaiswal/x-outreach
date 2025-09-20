require("dotenv").config();
const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const { TwitterAutomationSystem } = require('./src/main.js');
const { decrypt } = require('./src/utils/crypto.js');

const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null
});

console.log('🚀 Worker process started, waiting for jobs...');

const worker = new Worker('automation-jobs', async (job) => {
    const { userConfig } = job.data;

    console.log(`🤖 Starting job ${job.id} for user ${userConfig.userId}...`);

    try {
        // Decrypt the sensitive credentials before using them
        const decryptedConfig = {
            ...userConfig,
            twitterPassword: decrypt(userConfig.encryptedTwitterPassword),
            googleCredentialsJson: decrypt(userConfig.encryptedGoogleCredentialsJson),
        };

        const system = new TwitterAutomationSystem(decryptedConfig);
        await system.start();
        console.log(`✅ Job ${job.id} for user ${userConfig.userId} completed successfully.`);
    } catch (error) {
        console.error(`❌ Job ${job.id} for user ${userConfig.userId} failed:`, error.message);
        // The error will be stored on the job in Redis for inspection.
        throw error; // Re-throw to mark the job as failed
    }
}, { connection });

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
});