const express = require('express');
const router = express.Router();

const { getAnalytics } = require('../controllers/analytics.controller');
const { compareProfiles } = require('../controllers/compare.controller');
const { getRecommendations } = require('../controllers/recommendations.controller');
const { getUpcomingContests } = require('../controllers/contests.controller');
const { getLeaderboard } = require('../controllers/leaderboard.controller');

// Health Check
router.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        service: 'CodePulse Backend API',
        timestamp: new Date().toISOString()
    });
});

// Analytics Route
router.get('/analytics', getAnalytics);

// Stalk / Compare Route
router.post('/compare', compareProfiles);

// Recommendations Route
router.get('/recommendations', getRecommendations);

// Live Contests Route
router.get('/contests', getUpcomingContests);

// Leaderboard Route
router.get('/leaderboard', getLeaderboard);

module.exports = router;
