/**
 * Leaderboard Controller - Authentic Live Data Only (No Fake Data)
 */

async function getLeaderboard(req, res) {
    try {
        // Return empty leaderboard by default; client populates authentic "You" and custom added friends
        res.json({
            status: "success",
            leaderboard: []
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to fetch leaderboard rankings" });
    }
}

module.exports = {
    getLeaderboard
};
