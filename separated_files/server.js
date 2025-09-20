require("dotenv").config();
const express = require('express');
const path = require('path');
const { automationQueue } = require('./queue.js');
const { encrypt } = require('./src/utils/crypto.js');
// In a real app, you'd have user models and database functions
// const User = require('./src/database/models/User');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

const PORT = process.env.PORT || 3000;

// --- Frontend & Static Files ---
app.get('/', (req, res) => {
    // This would serve your main SaaS dashboard application
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- API Endpoints ---

/**
 * A placeholder for an authentication middleware.
 * In a real app, this would verify a JWT from the Authorization header.
 */
const authenticateUser = (req, res, next) => {
    // For now, we'll simulate a logged-in user.
    // In a real app, you would decode a token: const user = jwt.verify(...)
    req.user = {
        id: 'user_123',
        // This data would come from your database
        subscriptionTier: 'free', // 'free', 'premium'
        trialActionsUsed: 0,
    };
    console.log(`Simulating authentication for user: ${req.user.id}`);
    next();
};

/**
 * API endpoint for a user to start their automation bot.
 * This is what the user's dashboard would call.
 */
app.post('/api/bot/start', authenticateUser, async (req, res) => {
    try {
        const user = req.user;

        // Get settings from the request body (sent from the user's dashboard)
        const {
            twitterUsername,
            twitterPassword,
            googleSheetsId,
            googleCredentialsJson,
            keywords,
            messageTemplates
        } = req.body;

        // --- Subscription & Trial Logic ---
        let userConfig = {
            userId: user.id,
            twitterUsername,
            encryptedTwitterPassword: encrypt(twitterPassword),
            googleSheetsId,
            encryptedGoogleCredentialsJson: encrypt(googleCredentialsJson),
            keywords,
            messageTemplates,
            isPremium: false,
            // Default limits for all users
            rateLimits: {
                likesPerDay: 5,
                retweetsPerDay: 5,
                commentsPerDay: 5,
                dmPerDay: 0, // DMs are disabled by default
            }
        };

        if (user.subscriptionTier === 'premium') {
            console.log(`User ${user.id} is on a premium plan.`);
            userConfig.isPremium = true;
            // Premium users get higher limits
            userConfig.rateLimits.dmPerDay = 30;
            userConfig.rateLimits.likesPerDay = 100;
        } else if (user.trialActionsUsed < 3) {
            console.log(`User ${user.id} is on a free trial.`);
            // Free trial users get very limited actions, but no DMs.
            // The limits are already set to 5 actions and 0 DMs.
        } else {
            console.log(`User ${user.id} has exhausted their free trial.`);
            return res.status(403).json({ error: 'Free trial exhausted. Please upgrade to a paid plan to continue.' });
        }

        // Add a job to the queue for this user.
        // The job ID is unique to the user to prevent duplicate running jobs.
        await automationQueue.add(`user-automation-${user.id}`, { userConfig }, {
            jobId: `user-automation-${user.id}`,
            removeOnComplete: true, // Clean up successful jobs
            removeOnFail: 100 // Keep last 100 failed jobs for debugging
        });

        res.status(202).json({ message: 'Your automation bot has been successfully scheduled to run.' });
    } catch (error) {
        console.error('API Error on /api/bot/start:', error);
        res.status(500).json({ error: 'Failed to schedule automation job.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});
