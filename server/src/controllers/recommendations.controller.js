const RECOMMENDATIONS_POOL = {
    easy: [
        { title: "Watermelon", platform: "Codeforces", difficulty: "800", link: "https://codeforces.com/problemset/problem/4/A", tags: ["brute force", "math"] },
        { title: "Way Too Long Words", platform: "Codeforces", difficulty: "800", link: "https://codeforces.com/problemset/problem/71/A", tags: ["strings"] },
        { title: "Two Sum", platform: "LeetCode", difficulty: "Easy", link: "https://leetcode.com/problems/two-sum/", tags: ["hash table", "array"] },
        { title: "Palindrome Number", platform: "LeetCode", difficulty: "Easy", link: "https://leetcode.com/problems/palindrome-number/", tags: ["math"] },
        { title: "Chef and Brain Speed", platform: "CodeChef", difficulty: "Easy", link: "https://www.codechef.com/problems/CBSPEED", tags: ["basic math"] },
        { title: "Water Consumption", platform: "CodeChef", difficulty: "Easy", link: "https://www.codechef.com/problems/WATERCONS", tags: ["implementation"] },
        { title: "ABC300 A - N-choice question", platform: "AtCoder", difficulty: "Easy", link: "https://atcoder.jp/contests/abc300/tasks/abc300_a", tags: ["implementation"] },
        { title: "ABC299 B - Trick Taking", platform: "AtCoder", difficulty: "Easy", link: "https://atcoder.jp/contests/abc299/tasks/abc299_b", tags: ["simulation"] },
        { title: "Solve Me First", platform: "HackerRank", difficulty: "Easy", link: "https://www.hackerrank.com/challenges/solve-me-first/problem", tags: ["warmup"] },
        { title: "Simple Array Sum", platform: "HackerRank", difficulty: "Easy", link: "https://www.hackerrank.com/challenges/simple-array-sum/problem", tags: ["arrays"] },
        { title: "Subarray with Given Sum", platform: "GeeksforGeeks", difficulty: "Easy", link: "https://www.geeksforgeeks.org/problems/subarray-with-given-sum/1", tags: ["arrays", "prefix sum"] },
        { title: "Missing Number in Array", platform: "GeeksforGeeks", difficulty: "Easy", link: "https://www.geeksforgeeks.org/problems/missing-number-in-array/1", tags: ["math", "arrays"] }
    ],
    medium: [
        { title: "Add Two Numbers", platform: "LeetCode", difficulty: "Medium", link: "https://leetcode.com/problems/add-two-numbers/", tags: ["linked list", "math"] },
        { title: "Longest Substring Without Repeating Characters", platform: "LeetCode", difficulty: "Medium", link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", tags: ["hash table", "sliding window"] },
        { title: "Interesting Drink", platform: "Codeforces", difficulty: "1100", link: "https://codeforces.com/problemset/problem/706/B", tags: ["binary search", "dp"] },
        { title: "T-primes", platform: "Codeforces", difficulty: "1300", link: "https://codeforces.com/problemset/problem/230/B", tags: ["math", "number theory"] },
        { title: "Single-use Attack", platform: "CodeChef", difficulty: "Medium", link: "https://www.codechef.com/problems/SINGLEUSE", tags: ["greedy"] },
        { title: "Building Race", platform: "CodeChef", difficulty: "Medium", link: "https://www.codechef.com/problems/BUILDINGRACE", tags: ["math", "speed"] },
        { title: "ABC298 C - Cards Query Problem", platform: "AtCoder", difficulty: "Medium", link: "https://atcoder.jp/contests/abc298/tasks/abc298_c", tags: ["data structures"] },
        { title: "ABC297 D - Count Subtractions", platform: "AtCoder", difficulty: "Medium", link: "https://atcoder.jp/contests/abc297/tasks/abc297_d", tags: ["math", "euclidean"] },
        { title: "Staircase", platform: "HackerRank", difficulty: "Medium", link: "https://www.hackerrank.com/challenges/staircase/problem", tags: ["loops"] },
        { title: "Mini-Max Sum", platform: "HackerRank", difficulty: "Medium", link: "https://www.hackerrank.com/challenges/mini-max-sum/problem", tags: ["greedy"] },
        { title: "Kadane's Algorithm", platform: "GeeksforGeeks", difficulty: "Medium", link: "https://www.geeksforgeeks.org/problems/kadanes-algorithm/1", tags: ["dynamic programming", "arrays"] },
        { title: "Check for BST", platform: "GeeksforGeeks", difficulty: "Medium", link: "https://www.geeksforgeeks.org/problems/check-for-bst/1", tags: ["trees", "binary search tree"] }
    ],
    hard: [
        { title: "Median of Two Sorted Arrays", platform: "LeetCode", difficulty: "Hard", link: "https://leetcode.com/problems/median-of-two-sorted-arrays/", tags: ["array", "binary search"] },
        { title: "N-Queens", platform: "LeetCode", difficulty: "Hard", link: "https://leetcode.com/problems/n-queens/", tags: ["backtracking"] },
        { title: "Registration System", platform: "Codeforces", difficulty: "1500", link: "https://codeforces.com/problemset/problem/4/C", tags: ["data structures", "hashing"] },
        { title: "Chef Product", platform: "CodeChef", difficulty: "Hard", link: "https://www.codechef.com/problems/CHFPROD", tags: ["binary search", "math"] },
        { title: "ABC296 E - Transition Game", platform: "AtCoder", difficulty: "Hard", link: "https://atcoder.jp/contests/abc296/tasks/abc296_e", tags: ["functional graph"] },
        { title: "Time Conversion", platform: "HackerRank", difficulty: "Hard", link: "https://www.hackerrank.com/challenges/time-conversion/problem", tags: ["strings"] },
        { title: "N-Queen Problem", platform: "GeeksforGeeks", difficulty: "Hard", link: "https://www.geeksforgeeks.org/problems/n-queen-problem/1", tags: ["backtracking"] }
    ]
};

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function getRecommendations(req, res) {
    try {
        const level = (req.query.level || 'matched').toLowerCase();
        let results = [];

        if (level === 'easy') {
            results = shuffle(RECOMMENDATIONS_POOL.easy);
        } else if (level === 'medium') {
            results = shuffle(RECOMMENDATIONS_POOL.medium);
        } else if (level === 'hard') {
            results = shuffle(RECOMMENDATIONS_POOL.hard);
        } else {
            results = shuffle([].concat(RECOMMENDATIONS_POOL.easy, RECOMMENDATIONS_POOL.medium, RECOMMENDATIONS_POOL.hard));
        }

        res.json({
            status: "success",
            level: level,
            recommendations: results
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to generate recommendations" });
    }
}

module.exports = {
    getRecommendations
};
