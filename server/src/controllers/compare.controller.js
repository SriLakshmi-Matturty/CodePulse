const { fetchCodeforcesData } = require('../services/codeforces.service');
const { fetchLeetCodeData } = require('../services/leetcode.service');
const { fetchGitHubData } = require('../services/github.service');
const { fetchCodeChefData } = require('../services/codechef.service');
const { fetchAtCoderData } = require('../services/atcoder.service');
const { fetchHackerRankData } = require('../services/hackerrank.service');
const { fetchGFGData } = require('../services/gfg.service');

async function getProfileData(handles = {}) {
    const [cf, lc, gh, cc, ac, hr, gfg] = await Promise.all([
        fetchCodeforcesData(handles.codeforces),
        fetchLeetCodeData(handles.leetcode),
        fetchGitHubData(handles.github),
        fetchCodeChefData(handles.codechef),
        fetchAtCoderData(handles.atcoder),
        fetchHackerRankData(handles.hackerrank),
        fetchGFGData(handles.gfg)
    ]);

    const allSubs = []
        .concat(cf.submissions || [])
        .concat(lc.submissions || [])
        .concat(gh.commits || [])
        .concat(cc.submissions || [])
        .concat(ac.submissions || [])
        .concat(hr.submissions || [])
        .concat(gfg.submissions || []);
    
    const solvedSet = new Set();
    allSubs.forEach(s => {
        if (s.verdict === "Accepted" && s.platform !== "GitHub") {
            solvedSet.add(`${s.platform}-${s.problemName}`);
        }
    });

    return {
        rating: cf.rating || "Unrated",
        ccRating: cc.rating || "Unrated",
        acRating: ac.rating || "Unrated",
        hrRating: hr.rating || "Unrated",
        gfgRating: gfg.rating || "Unrated",
        totalSolved: solvedSet.size || (lc.submissions ? lc.submissions.length : 0),
        gitCommits: gh.commitCount || 0,
        submissionsCount: allSubs.length,
        recentSubmissions: allSubs.slice(0, 8)
    };
}

async function compareProfiles(req, res) {
    try {
        const { user1, user2 } = req.body || {};

        if (!user1 || !user2) {
            return res.status(400).json({ status: "error", message: "user1 and user2 handle configurations required" });
        }

        const [profile1, profile2] = await Promise.all([
            getProfileData(user1),
            getProfileData(user2)
        ]);

        res.json({
            status: "success",
            user1: { handles: user1, stats: profile1 },
            user2: { handles: user2, stats: profile2 }
        });
    } catch (error) {
        console.error("Error in compareProfiles:", error);
        res.status(500).json({ status: "error", message: "Failed to compare user profiles" });
    }
}

module.exports = {
    compareProfiles
};
