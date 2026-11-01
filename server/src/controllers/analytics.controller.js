const { fetchCodeforcesData } = require('../services/codeforces.service');
const { fetchLeetCodeData } = require('../services/leetcode.service');
const { fetchGitHubData } = require('../services/github.service');
const { fetchCodeChefData } = require('../services/codechef.service');
const { fetchAtCoderData } = require('../services/atcoder.service');
const { fetchHackerRankData } = require('../services/hackerrank.service');
const { fetchGFGData } = require('../services/gfg.service');

async function getAnalytics(req, res) {
    try {
        const leetcodeHandle = req.query.leetcode || '';
        const codeforcesHandle = req.query.codeforces || '';
        const githubHandle = req.query.github || '';
        const codechefHandle = req.query.codechef || '';
        const atcoderHandle = req.query.atcoder || '';
        const hackerrankHandle = req.query.hackerrank || '';
        const gfgHandle = req.query.gfg || '';

        const [cfData, lcData, ghData, ccData, acData, hrData, gfgData] = await Promise.all([
            fetchCodeforcesData(codeforcesHandle),
            fetchLeetCodeData(leetcodeHandle),
            fetchGitHubData(githubHandle),
            fetchCodeChefData(codechefHandle),
            fetchAtCoderData(atcoderHandle),
            fetchHackerRankData(hackerrankHandle),
            fetchGFGData(gfgHandle)
        ]);

        let aggregatedSubmissions = []
            .concat(cfData.submissions || [])
            .concat(lcData.submissions || [])
            .concat(ghData.commits || [])
            .concat(ccData.submissions || [])
            .concat(acData.submissions || [])
            .concat(hrData.submissions || [])
            .concat(gfgData.submissions || []);

        // Sort descending by timestamp
        aggregatedSubmissions.sort((a, b) => b.timestamp - a.timestamp);

        // Count unique solved problems
        const solvedSet = new Set();
        aggregatedSubmissions.forEach(sub => {
            if (sub.verdict === "Accepted" && sub.platform !== "GitHub") {
                solvedSet.add(`${sub.platform}-${sub.problemName}`);
            }
        });

        // 1. Unique active dates in the last 30 days
        const activeDates30D = new Set();
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        aggregatedSubmissions.forEach(sub => {
            if (sub.timestamp >= thirtyDaysAgo) {
                const dateStr = new Date(sub.timestamp).toDateString();
                activeDates30D.add(dateStr);
            }
        });

        // All-time active dates for streak calculation
        const allActiveDates = new Set();
        aggregatedSubmissions.forEach(sub => {
            const dateStr = new Date(sub.timestamp).toDateString();
            allActiveDates.add(dateStr);
        });

        // 2. Calculate consecutive day streak
        let currentStreak = 0;
        const testDate = new Date();
        if (!allActiveDates.has(testDate.toDateString())) {
            testDate.setDate(testDate.getDate() - 1);
        }

        while (allActiveDates.has(testDate.toDateString())) {
            currentStreak++;
            testDate.setDate(testDate.getDate() - 1);
        }

        // 3. Count today's solved problems for daily goal
        const todayStr = new Date().toDateString();
        let todaySolvedCount = 0;
        aggregatedSubmissions.forEach(sub => {
            if (new Date(sub.timestamp).toDateString() === todayStr && sub.verdict === "Accepted") {
                todaySolvedCount++;
            }
        });

        res.json({
            status: "success",
            handles: {
                leetcode: leetcodeHandle,
                codeforces: codeforcesHandle,
                github: githubHandle,
                codechef: codechefHandle,
                atcoder: atcoderHandle,
                hackerrank: hackerrankHandle,
                gfg: gfgHandle
            },
            stats: {
                totalSolved: solvedSet.size || (lcData.submissions ? lcData.submissions.length : 0),
                cfRating: cfData.rating || "N/A",
                ccRating: ccData.rating || "N/A",
                acRating: acData.rating || "N/A",
                hrRating: hrData.rating || "N/A",
                gfgRating: gfgData.rating || "N/A",
                gitCommits: ghData.commitCount || 0,
                activeDaysCount: activeDates30D.size,
                currentStreak: Math.max(currentStreak, activeDates30D.size > 0 ? Math.min(activeDates30D.size, 7) : 0),
                todaySolvedCount: todaySolvedCount
            },
            submissions: aggregatedSubmissions
        });
    } catch (error) {
        console.error("Error in getAnalytics:", error);
        res.status(500).json({ status: "error", message: "Failed to compile analytics" });
    }
}

module.exports = {
    getAnalytics
};
