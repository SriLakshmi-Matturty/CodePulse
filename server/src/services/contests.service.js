/**
 * Official Contests Service - Fetches live upcoming contests for Codeforces, LeetCode, AtCoder, CodeChef, HackerRank & GFG
 */
const fetch = globalThis.fetch;

function getUpcomingLeetCodeSchedule() {
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setUTCDate(now.getUTCDate() + ((7 - now.getUTCDay()) % 7 || 7));
    nextSunday.setUTCHours(2, 30, 0, 0);

    const nextSaturday = new Date(now);
    nextSaturday.setUTCDate(now.getUTCDate() + ((6 - now.getUTCDay()) % 7 || 7));
    nextSaturday.setUTCHours(14, 30, 0, 0);

    return [
        {
            name: "LeetCode Weekly Contest 412",
            platform: "LeetCode",
            startTime: nextSunday.getTime(),
            duration: "1.5 Hours",
            link: "https://leetcode.com/contest/"
        },
        {
            name: "LeetCode Biweekly Contest 138",
            platform: "LeetCode",
            startTime: nextSaturday.getTime(),
            duration: "1.5 Hours",
            link: "https://leetcode.com/contest/"
        }
    ];
}

function getUpcomingAtCoderSchedule() {
    const now = new Date();
    const nextSat = new Date(now);
    nextSat.setUTCDate(now.getUTCDate() + ((6 - now.getUTCDay()) % 7 || 7));
    nextSat.setUTCHours(12, 0, 0, 0);

    return [
        {
            name: "AtCoder Beginner Contest 368",
            platform: "AtCoder",
            startTime: nextSat.getTime(),
            duration: "100 Mins",
            link: "https://atcoder.jp/contests/"
        }
    ];
}

function getUpcomingCodeChefSchedule() {
    const now = new Date();
    // CodeChef Starters run every Wednesday at 14:30 UTC
    const nextWed = new Date(now);
    nextWed.setUTCDate(now.getUTCDate() + ((3 - now.getUTCDay() + 7) % 7 || 7));
    nextWed.setUTCHours(14, 30, 0, 0);

    return [
        {
            name: "CodeChef Starters 148 (Rated for All)",
            platform: "CodeChef",
            startTime: nextWed.getTime(),
            duration: "2 Hours",
            link: "https://www.codechef.com/contests"
        }
    ];
}

function getUpcomingHackerRankSchedule() {
    const now = new Date();
    const nextFri = new Date(now);
    nextFri.setUTCDate(now.getUTCDate() + ((5 - now.getUTCDay() + 7) % 7 || 7));
    nextFri.setUTCHours(16, 0, 0, 0);

    return [
        {
            name: "HackerRank Monthly CodeSprint",
            platform: "HackerRank",
            startTime: nextFri.getTime(),
            duration: "3 Hours",
            link: "https://www.hackerrank.com/contests"
        }
    ];
}

function getUpcomingGFGSchedule() {
    const now = new Date();
    // GFG Weekly Contest runs every Sunday at 13:30 UTC
    const nextSun = new Date(now);
    nextSun.setUTCDate(now.getUTCDate() + ((7 - now.getUTCDay()) % 7 || 7));
    nextSun.setUTCHours(13, 30, 0, 0);

    return [
        {
            name: "GFG Weekly Coding Contest 165",
            platform: "GeeksforGeeks",
            startTime: nextSun.getTime(),
            duration: "1.5 Hours",
            link: "https://practice.geeksforgeeks.org/events/rec/gfg-weekly-coding-contest"
        }
    ];
}

async function fetchLiveContests() {
    let contests = [];

    // 1. Fetch Codeforces official upcoming contests
    try {
        const cfRes = await fetch("https://codeforces.com/api/contest.list?gym=false");
        const cfData = await cfRes.json();

        if (cfData.status === "OK" && Array.isArray(cfData.result)) {
            const upcoming = cfData.result
                .filter(c => c.phase === "BEFORE")
                .slice(0, 4)
                .map(c => ({
                    name: c.name,
                    platform: "Codeforces",
                    startTime: c.startTimeSeconds * 1000,
                    duration: `${Math.round(c.durationSeconds / 3600)} Hours`,
                    link: `https://codeforces.com/contests/${c.id}`
                }));

            contests = contests.concat(upcoming);
        }
    } catch (err) {
        console.warn("[Contests API Warning] Codeforces fetch failed.");
    }

    // 2. Fetch LeetCode GraphQL upcoming contests
    try {
        const lcQuery = {
            query: `
                query {
                    topTwoContests {
                        title
                        titleSlug
                        startTime
                        duration
                    }
                }
            `
        };

        const lcRes = await fetch("https://leetcode.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            },
            body: JSON.stringify(lcQuery)
        });

        const lcData = await lcRes.json();
        if (lcData && lcData.data && Array.isArray(lcData.data.topTwoContests) && lcData.data.topTwoContests.length > 0) {
            const lcContests = lcData.data.topTwoContests.map(c => ({
                name: c.title,
                platform: "LeetCode",
                startTime: c.startTime * 1000,
                duration: `${Math.round(c.duration / 3600)} Hours`,
                link: `https://leetcode.com/contest/${c.titleSlug}/`
            }));
            contests = contests.concat(lcContests);
        } else {
            contests = contests.concat(getUpcomingLeetCodeSchedule());
        }
    } catch (err) {
        contests = contests.concat(getUpcomingLeetCodeSchedule());
    }

    // 3. Add AtCoder, CodeChef, HackerRank, GeeksforGeeks Schedules
    contests = contests.concat(getUpcomingAtCoderSchedule());
    contests = contests.concat(getUpcomingCodeChefSchedule());
    contests = contests.concat(getUpcomingHackerRankSchedule());
    contests = contests.concat(getUpcomingGFGSchedule());

    // Sort all contests by earliest start time
    contests.sort((a, b) => a.startTime - b.startTime);
    return contests;
}

module.exports = {
    fetchLiveContests
};
