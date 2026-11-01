const { fetchLiveContests } = require('../services/contests.service');

async function getUpcomingContests(req, res) {
    try {
        const contests = await fetchLiveContests();
        res.json({
            status: "success",
            contests: contests
        });
    } catch (error) {
        console.error("Error in getUpcomingContests:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch live contest schedule" });
    }
}

module.exports = {
    getUpcomingContests
};
