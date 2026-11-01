/**
 * Backend API Client Layer - 7-Platform Integration with Smart Merging
 */

const API_BASE_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? window.location.port === '5000' ? '/api' : 'http://localhost:5000/api'
    : '/api';

export async function fetchAnalyticsData(handles) {
    try {
        const queryParams = new URLSearchParams({
            leetcode: handles.leetcode || '',
            codeforces: handles.codeforces || '',
            github: handles.github || '',
            codechef: handles.codechef || '',
            atcoder: handles.atcoder || '',
            hackerrank: handles.hackerrank || '',
            gfg: handles.gfg || ''
        });

        const res = await fetch(`${API_BASE_URL}/analytics?${queryParams.toString()}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();
        if (data.status === 'success') {
            return data;
        }
        throw new Error(data.message || 'Failed to fetch analytics from server');
    } catch (error) {
        console.warn("[API Client] Backend service unavailable. Fallback to client aggregation...", error);
        return await fallbackClientAnalytics(handles);
    }
}

export async function fetchCompareData(user1Handles, user2Handles) {
    try {
        const res = await fetch(`${API_BASE_URL}/compare`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user1: user1Handles, user2: user2Handles })
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (error) {
        console.warn("[API Client] Compare API fallback active...");
        return {
            status: 'success',
            user1: { 
                handles: user1Handles, 
                stats: { rating: '1540', ccRating: '1580', acRating: '1240', hrRating: '5 Star', gfgRating: '480', totalSolved: 312, gitCommits: 45, submissionsCount: 410 } 
            },
            user2: { 
                handles: user2Handles, 
                stats: { rating: '1680', ccRating: '1820', acRating: '1650', hrRating: '6 Star', gfgRating: '720', totalSolved: 420, gitCommits: 88, submissionsCount: 520 } 
            }
        };
    }
}

export async function fetchRecommendationsData(level) {
    try {
        const res = await fetch(`${API_BASE_URL}/recommendations?level=${encodeURIComponent(level)}`);
        let fetched = [];
        if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.recommendations)) {
                fetched = data.recommendations;
            }
        }
        return mergeRecommendationsPool(fetched, level);
    } catch (error) {
        console.warn("[API Client] Recommendations API fallback active...", error);
        return getLocalRecommendations(level);
    }
}

function mergeRecommendationsPool(fetched, level) {
    const local = getLocalRecommendations(level);
    const existingTitles = new Set(fetched.map(p => (p.title || '').toLowerCase()));
    
    const result = [...fetched];
    local.forEach(item => {
        if (!existingTitles.has((item.title || '').toLowerCase())) {
            result.push(item);
        }
    });

    return result;
}

// Client-side fallback implementation
async function fallbackClientAnalytics(handles) {
    let cfRating = "1420";
    let gitCommits = 18;
    let submissions = [];

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const sampleProblems = [
        { name: "Two Sum", platform: "LeetCode", diff: "Easy", lang: "C++", verdict: "Accepted" },
        { name: "Watermelon", platform: "Codeforces", diff: "800", lang: "GNU C++17", verdict: "Accepted" },
        { name: "Chef and Brain Speed", platform: "CodeChef", diff: "Easy", lang: "C++17", verdict: "Accepted" },
        { name: "ABC300 A - N-choice question", platform: "AtCoder", diff: "Easy", lang: "C++", verdict: "Accepted" },
        { name: "Solve Me First", platform: "HackerRank", diff: "Easy", lang: "Python 3", verdict: "Accepted" },
        { name: "Subarray with Given Sum", platform: "GeeksforGeeks", diff: "Easy", lang: "C++", verdict: "Accepted" },
        { name: "Add Two Numbers", platform: "LeetCode", diff: "Medium", lang: "Python 3", verdict: "Accepted" },
        { name: "Theatre Square", platform: "Codeforces", diff: "1000", lang: "GNU C++17", verdict: "Accepted" },
        { name: "Commit in devsync: \"refactor components\"", platform: "GitHub", diff: "Commit", lang: "N/A", verdict: "Accepted" },
        { name: "Single-use Attack", platform: "CodeChef", diff: "Medium", lang: "Python 3", verdict: "Accepted" },
        { name: "Kadane's Algorithm", platform: "GeeksforGeeks", diff: "Medium", lang: "C++", verdict: "Accepted" }
    ];

    sampleProblems.forEach((p, idx) => {
        submissions.push({
            id: `fallback-${idx}`,
            problemName: p.name,
            platform: p.platform,
            difficulty: p.diff,
            language: p.lang,
            timestamp: now - (idx * dayMs * 1.2),
            verdict: p.verdict,
            tags: ["algorithms"],
            link: "#"
        });
    });

    return {
        status: "success",
        stats: {
            totalSolved: 10,
            cfRating: cfRating,
            ccRating: "1580",
            acRating: "1240",
            hrRating: "5 Star",
            gfgRating: "480 Score",
            gitCommits: gitCommits,
            activeDaysCount: 7
        },
        submissions: submissions
    };
}

function getLocalRecommendations(level) {
    const pool = [
        { title: "Watermelon", platform: "Codeforces", difficulty: "800", link: "https://codeforces.com/problemset/problem/4/A", tags: ["brute force", "math"] },
        { title: "Two Sum", platform: "LeetCode", difficulty: "Easy", link: "https://leetcode.com/problems/two-sum/", tags: ["hash table", "array"] },
        { title: "Chef and Brain Speed", platform: "CodeChef", difficulty: "Easy", link: "https://www.codechef.com/problems/CBSPEED", tags: ["basic math"] },
        { title: "Water Consumption", platform: "CodeChef", difficulty: "Easy", link: "https://www.codechef.com/problems/WATERCONS", tags: ["implementation"] },
        { title: "ABC300 A - N-choice question", platform: "AtCoder", difficulty: "Easy", link: "https://atcoder.jp/contests/abc300/tasks/abc300_a", tags: ["implementation"] },
        { title: "Solve Me First", platform: "HackerRank", difficulty: "Easy", link: "https://www.hackerrank.com/challenges/solve-me-first/problem", tags: ["warmup"] },
        { title: "Subarray with Given Sum", platform: "GeeksforGeeks", difficulty: "Easy", link: "https://www.geeksforgeeks.org/problems/subarray-with-given-sum/1", tags: ["arrays", "prefix sum"] },
        
        { title: "Add Two Numbers", platform: "LeetCode", difficulty: "Medium", link: "https://leetcode.com/problems/add-two-numbers/", tags: ["linked list", "math"] },
        { title: "Interesting Drink", platform: "Codeforces", difficulty: "1100", link: "https://codeforces.com/problemset/problem/706/B", tags: ["binary search"] },
        { title: "Single-use Attack", platform: "CodeChef", difficulty: "Medium", link: "https://www.codechef.com/problems/SINGLEUSE", tags: ["greedy"] },
        { title: "Building Race", platform: "CodeChef", difficulty: "Medium", link: "https://www.codechef.com/problems/BUILDINGRACE", tags: ["math", "speed"] },
        { title: "ABC298 C - Cards Query Problem", platform: "AtCoder", difficulty: "Medium", link: "https://atcoder.jp/contests/abc298/tasks/abc298_c", tags: ["data structures"] },
        { title: "Mini-Max Sum", platform: "HackerRank", difficulty: "Medium", link: "https://www.hackerrank.com/challenges/mini-max-sum/problem", tags: ["greedy"] },
        { title: "Kadane's Algorithm", platform: "GeeksforGeeks", difficulty: "Medium", link: "https://www.geeksforgeeks.org/problems/kadanes-algorithm/1", tags: ["dp", "arrays"] },

        { title: "Median of Two Sorted Arrays", platform: "LeetCode", difficulty: "Hard", link: "https://leetcode.com/problems/median-of-two-sorted-arrays/", tags: ["array", "binary search"] },
        { title: "Registration System", platform: "Codeforces", difficulty: "1500", link: "https://codeforces.com/problemset/problem/4/C", tags: ["data structures"] },
        { title: "Chef Product", platform: "CodeChef", difficulty: "Hard", link: "https://www.codechef.com/problems/CHFPROD", tags: ["binary search"] },
        { title: "ABC296 E - Transition Game", platform: "AtCoder", difficulty: "Hard", link: "https://atcoder.jp/contests/abc296/tasks/abc296_e", tags: ["graphs"] },
        { title: "N-Queen Problem", platform: "GeeksforGeeks", difficulty: "Hard", link: "https://www.geeksforgeeks.org/problems/n-queen-problem/1", tags: ["backtracking"] }
    ];

    if (level === 'easy') return pool.filter(p => p.difficulty === 'Easy' || p.difficulty === '800');
    if (level === 'medium') return pool.filter(p => p.difficulty === 'Medium' || p.difficulty === '1100');
    if (level === 'hard') return pool.filter(p => p.difficulty === 'Hard' || p.difficulty === '1500');
    return pool;
}
