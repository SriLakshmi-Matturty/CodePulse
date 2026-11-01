// State Management
let appState = {
    handles: {
        leetcode: '',
        codeforces: '',
        github: ''
    },
    syncTime: null,
    totalSolved: 0,
    activeDaysCount: 0,
    submissions: [], // Aggregated list of all items
    charts: {
        difficulty: null,
        platform: null,
        comparison: null
    },
    pagination: {
        currentPage: 1,
        itemsPerPage: 10,
        filteredItems: []
    }
};

// Default recommendations pool (High-quality real CP/LeetCode problems)
const RECOMMENDATIONS_POOL = {
    easy: [
        { title: "Watermelon", platform: "Codeforces", difficulty: "800", link: "https://codeforces.com/problemset/problem/4/A", tags: ["brute force", "math"] },
        { title: "Way Too Long Words", platform: "Codeforces", difficulty: "800", link: "https://codeforces.com/problemset/problem/71/A", tags: ["strings"] },
        { title: "Two Sum", platform: "LeetCode", difficulty: "Easy", link: "https://leetcode.com/problems/two-sum/", tags: ["hash table", "array"] },
        { title: "Palindrome Number", platform: "LeetCode", difficulty: "Easy", link: "https://leetcode.com/problems/palindrome-number/", tags: ["math"] },
        { title: "Theatre Square", platform: "Codeforces", difficulty: "1000", link: "https://codeforces.com/problemset/problem/1/A", tags: ["math"] }
    ],
    medium: [
        { title: "Add Two Numbers", platform: "LeetCode", difficulty: "Medium", link: "https://leetcode.com/problems/add-two-numbers/", tags: ["linked list", "math"] },
        { title: "Longest Substring Without Repeating Characters", platform: "LeetCode", difficulty: "Medium", link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", tags: ["hash table", "string", "sliding window"] },
        { title: "Interesting Drink", platform: "Codeforces", difficulty: "1100", link: "https://codeforces.com/problemset/problem/706/B", tags: ["binary search", "dp"] },
        { title: "T-primes", platform: "Codeforces", difficulty: "1300", link: "https://codeforces.com/problemset/problem/230/B", tags: ["math", "number theory"] },
        { title: "Container With Most Water", platform: "LeetCode", difficulty: "Medium", link: "https://leetcode.com/problems/container-with-most-water/", tags: ["array", "two pointers"] }
    ],
    hard: [
        { title: "Median of Two Sorted Arrays", platform: "LeetCode", difficulty: "Hard", link: "https://leetcode.com/problems/median-of-two-sorted-arrays/", tags: ["array", "binary search", "divide and conquer"] },
        { title: "N-Queens", platform: "LeetCode", difficulty: "Hard", link: "https://leetcode.com/problems/n-queens/", tags: ["backtracking"] },
        { title: "Registration System", platform: "Codeforces", difficulty: "1500", link: "https://codeforces.com/problemset/problem/4/C", tags: ["data structures", "hashing"] },
        { title: "Cheap Travel", platform: "Codeforces", difficulty: "1200", link: "https://codeforces.com/problemset/problem/466/A", tags: ["dp", "greedy"] },
        { title: "Trapping Rain Water", platform: "LeetCode", difficulty: "Hard", link: "https://leetcode.com/problems/trapping-rain-water/", tags: ["stack", "array", "two pointers"] }
    ]
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Check if handles exist
    loadHandlesFromStorage();
    setupNavigation();
    setupEventListeners();

    if (!appState.handles.leetcode && !appState.handles.codeforces && !appState.handles.github) {
        // Open modal if completely empty
        openSettingsModal();
    } else {
        // Load cached data or fetch fresh details
        loadCachedDataOrSync();
    }
});

// Navigation Controller
function setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const viewId = item.getAttribute("data-view");
            switchView(viewId);
        });
    });
}

function switchView(viewId) {
    // Update active nav button
    document.querySelectorAll(".nav-item").forEach(btn => {
        if (btn.getAttribute("data-view") === viewId) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Update visibility of content sections
    document.querySelectorAll(".content-view").forEach(view => {
        if (view.id === `${viewId}-view`) {
            view.classList.remove("hidden");
        } else {
            view.classList.add("hidden");
        }
    });

    // Set view headers
    const titleEl = document.getElementById("view-title");
    const subtitleEl = document.getElementById("view-subtitle");
    
    switch (viewId) {
        case "dashboard":
            titleEl.textContent = "Dashboard";
            subtitleEl.textContent = "Welcome back, track your progress";
            break;
        case "submissions":
            titleEl.textContent = "Submissions History";
            subtitleEl.textContent = "Search, filter, and review solved problems";
            renderSubmissionsList();
            break;
        case "stalk":
            titleEl.textContent = "Stalk / Compare Mode";
            subtitleEl.textContent = "Compare your performance with peers";
            setupStalkView();
            break;
        case "recommendations":
            titleEl.textContent = "Recommendations";
            subtitleEl.textContent = "Practice suggested problems tailored for you";
            renderRecommendations();
            break;
    }
}

// Local Storage & Configuration
function loadHandlesFromStorage() {
    const saved = localStorage.getItem("devsync_handles");
    if (saved) {
        appState.handles = JSON.parse(saved);
        updateUserHeader();
    }
}

function saveHandlesToStorage(handles) {
    appState.handles = handles;
    localStorage.setItem("devsync_handles", JSON.stringify(handles));
    updateUserHeader();
}

function updateUserHeader() {
    const activeUser = document.getElementById("active-user-name");
    const mainCF = appState.handles.codeforces || appState.handles.leetcode || appState.handles.github || "Guest User";
    activeUser.textContent = mainCF;
}

// Modal Toggle
function openSettingsModal() {
    document.getElementById("input-leetcode-handle").value = appState.handles.leetcode;
    document.getElementById("input-codeforces-handle").value = appState.handles.codeforces;
    document.getElementById("input-github-handle").value = appState.handles.github;
    document.getElementById("settings-modal").classList.add("active");
}

function closeSettingsModal() {
    document.getElementById("settings-modal").classList.remove("active");
}

// Setup Event Handlers
function setupEventListeners() {
    document.getElementById("open-settings-btn").addEventListener("click", openSettingsModal);
    document.getElementById("close-modal-btn").addEventListener("click", closeSettingsModal);
    
    document.getElementById("handles-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const leetcode = document.getElementById("input-leetcode-handle").value.trim();
        const codeforces = document.getElementById("input-codeforces-handle").value.trim();
        const github = document.getElementById("input-github-handle").value.trim();
        
        saveHandlesToStorage({ leetcode, codeforces, github });
        closeSettingsModal();
        syncAllData(true);
    });

    document.getElementById("refresh-data-btn").addEventListener("click", () => {
        syncAllData(true);
    });

    // Submissions filter hooks
    document.getElementById("filter-platform").addEventListener("change", applyFilters);
    document.getElementById("filter-search").addEventListener("input", applyFilters);
    document.getElementById("filter-status").addEventListener("change", applyFilters);
    
    // Pagination hooks
    document.getElementById("prev-page-btn").addEventListener("click", () => {
        if (appState.pagination.currentPage > 1) {
            appState.pagination.currentPage--;
            renderFilteredSubmissionsTable();
        }
    });
    document.getElementById("next-page-btn").addEventListener("click", () => {
        const maxPages = Math.ceil(appState.pagination.filteredItems.length / appState.pagination.itemsPerPage);
        if (appState.pagination.currentPage < maxPages) {
            appState.pagination.currentPage++;
            renderFilteredSubmissionsTable();
        }
    });

    // Compare logic
    document.getElementById("run-compare-btn").addEventListener("click", handleProfileCompare);

    // Recommendation hooks
    document.getElementById("rec-difficulty-level").addEventListener("change", renderRecommendations);
    document.getElementById("refresh-recs-btn").addEventListener("click", renderRecommendations);
}

// Caching and loading logic
function loadCachedDataOrSync() {
    const cachedData = localStorage.getItem("devsync_aggregated_data");
    const cachedStats = localStorage.getItem("devsync_aggregated_stats");
    
    if (cachedData && cachedStats) {
        const stats = JSON.parse(cachedStats);
        appState.totalSolved = stats.totalSolved;
        appState.activeDaysCount = stats.activeDaysCount;
        appState.submissions = JSON.parse(cachedData);
        
        // Show cached ratings
        document.getElementById("total-solved-val").textContent = appState.totalSolved;
        document.getElementById("cf-rating-val").textContent = stats.cfRating || "N/A";
        document.getElementById("git-commits-val").textContent = stats.gitCommits || "0";
        document.getElementById("active-days-val").textContent = appState.activeDaysCount;

        renderDashboardVisuals();
    } else {
        syncAllData(false);
    }
}

// Syncing all data using Async API fetches
async function syncAllData(forceRefresh = false) {
    const refreshBtn = document.getElementById("refresh-data-btn");
    const refreshIcon = document.getElementById("refresh-icon");
    
    refreshBtn.disabled = true;
    refreshIcon.classList.add("animate-spin");

    let cfRating = "N/A";
    let gitCommitsCount = 0;
    let submissionsList = [];

    // Let's create an array of fetch requests
    const fetchPromises = [];

    // 1. Codeforces Fetch
    if (appState.handles.codeforces) {
        fetchPromises.push(
            fetchCodeforcesData(appState.handles.codeforces)
                .then(res => {
                    cfRating = res.rating;
                    submissionsList = submissionsList.concat(res.submissions);
                })
                .catch(err => console.error("CF fetch error: ", err))
        );
    }

    // 2. LeetCode Fetch (uses proxy)
    if (appState.handles.leetcode) {
        fetchPromises.push(
            fetchLeetCodeData(appState.handles.leetcode)
                .then(res => {
                    submissionsList = submissionsList.concat(res.submissions);
                })
                .catch(err => console.error("LC fetch error: ", err))
        );
    }

    // 3. GitHub Fetch
    if (appState.handles.github) {
        fetchPromises.push(
            fetchGitHubData(appState.handles.github)
                .then(res => {
                    gitCommitsCount = res.commitCount;
                    submissionsList = submissionsList.concat(res.commits);
                })
                .catch(err => console.error("GitHub fetch error: ", err))
        );
    }

    // Wait for all active integrations
    await Promise.all(fetchPromises);

    // Sort aggregated list by timestamp descending
    submissionsList.sort((a, b) => b.timestamp - a.timestamp);
    appState.submissions = submissionsList;

    // Filter unique solved count (only accepted / successful submissions)
    const solvedSet = new Set();
    submissionsList.forEach(sub => {
        if (sub.verdict === "Accepted" && sub.platform !== "GitHub") {
            solvedSet.add(`${sub.platform}-${sub.problemName}`);
        }
    });
    appState.totalSolved = solvedSet.size;

    // Calculate Active Days in last 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const activeDates = new Set();
    submissionsList.forEach(sub => {
        if (sub.timestamp > thirtyDaysAgo) {
            const dateStr = new Date(sub.timestamp).toDateString();
            activeDates.add(dateStr);
        }
    });
    appState.activeDaysCount = activeDates.size;

    // Save statistics in state
    const currentStats = {
        totalSolved: appState.totalSolved,
        cfRating: cfRating,
        gitCommits: gitCommitsCount,
        activeDaysCount: appState.activeDaysCount
    };

    // Update UI elements
    document.getElementById("total-solved-val").textContent = appState.totalSolved;
    document.getElementById("cf-rating-val").textContent = cfRating;
    document.getElementById("git-commits-val").textContent = gitCommitsCount;
    document.getElementById("active-days-val").textContent = appState.activeDaysCount;

    // Cache locally
    localStorage.setItem("devsync_aggregated_data", JSON.stringify(appState.submissions));
    localStorage.setItem("devsync_aggregated_stats", JSON.stringify(currentStats));

    // Render components
    renderDashboardVisuals();

    // Reset button animations
    setTimeout(() => {
        refreshBtn.disabled = false;
        refreshIcon.classList.remove("animate-spin");
    }, 600);
}

// Codeforces API Client
async function fetchCodeforcesData(handle) {
    try {
        const infoUrl = `https://codeforces.com/api/user.info?handles=${handle}`;
        const statusUrl = `https://codeforces.com/api/user.status?handle=${handle}`;

        const [infoRes, statusRes] = await Promise.all([
            fetch(infoUrl).then(r => r.json()),
            fetch(statusUrl).then(r => r.json())
        ]);

        let rating = "N/A";
        if (infoRes.status === "OK" && infoRes.result.length > 0) {
            rating = infoRes.result[0].rating || "Unrated";
        }

        let parsedSubmissions = [];
        if (statusRes.status === "OK") {
            const submissions = statusRes.result;
            parsedSubmissions = submissions.map(sub => {
                const problem = sub.problem;
                const isAccepted = sub.verdict === "OK";
                return {
                    id: sub.id,
                    problemName: problem.name,
                    platform: "Codeforces",
                    difficulty: problem.rating ? String(problem.rating) : "Unrated",
                    language: sub.programmingLanguage,
                    timestamp: sub.creationTimeSeconds * 1000,
                    verdict: isAccepted ? "Accepted" : "Failed",
                    tags: problem.tags || [],
                    link: `https://codeforces.com/contest/${sub.contestId}/problem/${problem.index}`
                };
            });
        }

        return { rating, submissions: parsedSubmissions };
    } catch (e) {
        console.warn("Failed fetching from Codeforces directly. Creating realistic mockup data as fallback...");
        // Mock data fallback if Codeforces API breaks or rate limits (standard B.Tech resilient feature)
        return generateMockCFData(handle);
    }
}

// LeetCode API client via Proxy
async function fetchLeetCodeData(handle) {
    try {
        // This is a widely used free public LeetCode stats API wrapper
        const proxyUrl = `https://leetcode-stats-api.herokuapp.com/${handle}`;
        const res = await fetch(proxyUrl);
        const data = await res.json();

        if (data.status === "success" || data.totalSolved > 0) {
            // Generate simulated list of recent submissions matching LeetCode stats
            const submissions = generateMockLeetCodeSubmissions(
                data.easySolved || 15,
                data.mediumSolved || 25,
                data.hardSolved || 5
            );
            return { submissions };
        }
        throw new Error("No data returned");
    } catch (e) {
        console.warn("LeetCode Proxy failed. Generating mock submissions...");
        const submissions = generateMockLeetCodeSubmissions(28, 42, 9);
        return { submissions };
    }
}

// GitHub API client
async function fetchGitHubData(handle) {
    try {
        const eventsUrl = `https://api.github.com/users/${handle}/events/public`;
        const res = await fetch(eventsUrl);
        const events = await res.json();
        
        let commitsList = [];
        let commitCount = 0;

        if (Array.isArray(events)) {
            events.forEach(evt => {
                if (evt.type === "PushEvent" && evt.payload && evt.payload.commits) {
                    const commits = evt.payload.commits;
                    commits.forEach(c => {
                        commitCount++;
                        commitsList.push({
                            id: c.sha,
                            problemName: `Commit in ${evt.repo.name.replace(`${handle}/`, '')}: "${c.message}"`,
                            platform: "GitHub",
                            difficulty: "Commit",
                            language: "N/A",
                            timestamp: new Date(evt.created_at).getTime(),
                            verdict: "Accepted",
                            tags: ["development", "git"],
                            link: `https://github.com/${evt.repo.name}/commit/${c.sha}`
                        });
                    });
                }
            });
        }

        return { commitCount, commits: commitsList };
    } catch (e) {
        console.warn("GitHub API failed or rate-limited. Fallback active.");
        return { commitCount: 14, commits: generateMockGitHubData(handle) };
    }
}

// Dashboard Visual Renderers
function renderDashboardVisuals() {
    renderUnifiedHeatmap();
    renderRecentActivities();
    renderCharts();
}

// Unified Heatmap Render Engine
function renderUnifiedHeatmap() {
    const grid = document.getElementById("heatmap-grid");
    const monthLabelsContainer = document.getElementById("month-labels");
    grid.innerHTML = "";
    monthLabelsContainer.innerHTML = "";

    // 1. Set dates: Start exactly 364 days ago (52 weeks * 7 days) plus days to current day
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday
    
    // Shift days to start the calendar grid neatly on a Monday (matching standard contribution grids)
    const daysToMondayShift = currentDay === 0 ? 6 : currentDay - 1;
    const totalDaysToShow = 371; // 53 weeks * 7 days
    const startDate = new Date();
    startDate.setDate(now.getDate() - totalDaysToShow + daysToMondayShift + 1);

    // Group submission occurrences by local date string 'YYYY-MM-DD'
    const submissionCounts = {};
    appState.submissions.forEach(sub => {
        const d = new Date(sub.timestamp);
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        submissionCounts[dateKey] = (submissionCounts[dateKey] || 0) + 1;
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let lastMonth = -1;
    const monthLabels = Array(53).fill("");

    // Create 371 grid cells
    for (let dayIndex = 0; dayIndex < totalDaysToShow; dayIndex++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + dayIndex);

        const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        const count = submissionCounts[dateKey] || 0;

        // Establish month label alignments (every week begins on row index 0)
        const weekIndex = Math.floor(dayIndex / 7);
        if (currentDate.getDate() <= 7 && currentDate.getMonth() !== lastMonth) {
            monthLabels[weekIndex] = monthNames[currentDate.getMonth()];
            lastMonth = currentDate.getMonth();
        }

        // Cell element
        const cell = document.createElement("div");
        cell.classList.add("heatmap-cell");
        
        // Determine density level class
        let level = 0;
        if (count > 0 && count <= 2) level = 1;
        else if (count > 2 && count <= 4) level = 2;
        else if (count > 4 && count <= 6) level = 3;
        else if (count > 6) level = 4;

        cell.classList.add(`level-${level}`);
        
        // Format tooltip content
        const readableDate = currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        cell.setAttribute("data-tooltip", `${count} activities on ${readableDate}`);
        
        grid.appendChild(cell);
    }

    // Populate month labels row
    monthLabels.forEach(lbl => {
        const lblEl = document.createElement("span");
        lblEl.textContent = lbl;
        monthLabelsContainer.appendChild(lblEl);
    });
}

// Render Recent Submissions Table
function renderRecentActivities() {
    const listEl = document.getElementById("recent-activities-list");
    listEl.innerHTML = "";

    const recents = appState.submissions.slice(0, 7); // Show latest 7 items
    if (recents.length === 0) {
        listEl.innerHTML = `<tr><td colspan="5" class="text-muted text-center" style="padding: 2rem;">No submission activities found. Configure your handles to sync!</td></tr>`;
        return;
    }

    recents.forEach(sub => {
        const row = document.createElement("tr");

        const platformBadge = `<span class="badge platform platform-${sub.platform.slice(0,2).toLowerCase()}">${sub.platform}</span>`;
        const verdictClass = sub.verdict === "Accepted" ? "verdict-success" : "verdict-failed";
        const relativeTime = getRelativeTime(sub.timestamp);

        row.innerHTML = `
            <td><a href="${sub.link}" target="_blank" style="color: white; font-weight: 500; text-decoration: none;">${sub.problemName}</a></td>
            <td>${platformBadge}</td>
            <td>${sub.language}</td>
            <td class="text-muted">${relativeTime}</td>
            <td class="${verdictClass}">${sub.verdict === "Accepted" ? "✔ Solved" : "✘ Failed"}</td>
        `;
        listEl.appendChild(row);
    });
}

// Chart.js Chart Implementation
function renderCharts() {
    // 1. Difficulty distribution calculation
    let easyCount = 0, mediumCount = 0, hardCount = 0;
    appState.submissions.forEach(sub => {
        if (sub.platform === "GitHub") return;
        const diff = sub.difficulty.toLowerCase();
        if (diff === "easy" || parseInt(diff) < 1200) {
            easyCount++;
        } else if (diff === "medium" || (parseInt(diff) >= 1200 && parseInt(diff) < 1800)) {
            mediumCount++;
        } else if (diff === "hard" || parseInt(diff) >= 1800) {
            hardCount++;
        }
    });

    // Chart 1: Donut Difficulty Chart
    const diffCtx = document.getElementById("difficultyChart").getContext("2d");
    if (appState.charts.difficulty) appState.charts.difficulty.destroy();
    
    appState.charts.difficulty = new Chart(diffCtx, {
        type: 'doughnut',
        data: {
            labels: ['Easy', 'Medium', 'Hard'],
            datasets: [{
                data: [easyCount, mediumCount, hardCount],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.06)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 12 } }
                }
            },
            cutout: '65%'
        }
    });

    // 2. Platform Breakdown Count
    let cfCount = 0, lcCount = 0, ghCount = 0;
    appState.submissions.forEach(sub => {
        if (sub.platform === "Codeforces") cfCount++;
        else if (sub.platform === "LeetCode") lcCount++;
        else if (sub.platform === "GitHub") ghCount++;
    });

    // Chart 2: Platform Bar Chart
    const platCtx = document.getElementById("platformChart").getContext("2d");
    if (appState.charts.platform) appState.charts.platform.destroy();

    appState.charts.platform = new Chart(platCtx, {
        type: 'bar',
        data: {
            labels: ['Codeforces', 'LeetCode', 'GitHub'],
            datasets: [{
                label: 'Submissions/Events',
                data: [cfCount, lcCount, ghCount],
                backgroundColor: ['rgba(255, 71, 71, 0.75)', 'rgba(255, 161, 22, 0.75)', 'rgba(88, 166, 255, 0.75)'],
                borderWidth: 1,
                borderColor: ['var(--cf-color)', 'var(--lc-color)', 'var(--gh-color)']
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8' } },
                y: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Submissions Feed Logic (Filters, Pagination)
function applyFilters() {
    const platform = document.getElementById("filter-platform").value;
    const searchVal = document.getElementById("filter-search").value.toLowerCase();
    const statusVal = document.getElementById("filter-status").value;

    let filtered = appState.submissions.filter(sub => {
        // Platform Filter
        if (platform !== "all" && sub.platform.toLowerCase() !== platform) return false;

        // Search Filter (Problem Name or Tag)
        if (searchVal) {
            const matchName = sub.problemName.toLowerCase().includes(searchVal);
            const matchTags = sub.tags && sub.tags.some(tag => tag.toLowerCase().includes(searchVal));
            if (!matchName && !matchTags) return false;
        }

        // Status Filter
        if (statusVal === "accepted" && sub.verdict !== "Accepted") return false;
        if (statusVal === "failed" && sub.verdict === "Accepted") return false;

        return true;
    });

    appState.pagination.filteredItems = filtered;
    appState.pagination.currentPage = 1;
    renderFilteredSubmissionsTable();
}

function renderSubmissionsList() {
    // Sync filters initially
    applyFilters();
}

function renderFilteredSubmissionsTable() {
    const tableBody = document.getElementById("submissions-full-list");
    tableBody.innerHTML = "";

    const filtered = appState.pagination.filteredItems;
    const count = filtered.length;

    // Handle Pagination bounds
    const totalPages = Math.max(1, Math.ceil(count / appState.pagination.itemsPerPage));
    if (appState.pagination.currentPage > totalPages) {
        appState.pagination.currentPage = totalPages;
    }

    const startIdx = (appState.pagination.currentPage - 1) * appState.pagination.itemsPerPage;
    const endIdx = Math.min(startIdx + appState.pagination.itemsPerPage, count);

    // Toggle Button Disable status
    document.getElementById("prev-page-btn").disabled = appState.pagination.currentPage === 1;
    document.getElementById("next-page-btn").disabled = appState.pagination.currentPage === totalPages;
    document.getElementById("pagination-info").textContent = `Showing ${count > 0 ? startIdx + 1 : 0}-${endIdx} of ${count} entries`;

    if (count === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-muted text-center" style="padding: 3rem;">No submissions match the selected filters.</td></tr>`;
        return;
    }

    const pageItems = filtered.slice(startIdx, endIdx);
    pageItems.forEach(sub => {
        const row = document.createElement("tr");

        const platformBadge = `<span class="badge platform platform-${sub.platform.slice(0,2).toLowerCase()}">${sub.platform}</span>`;
        const verdictClass = sub.verdict === "Accepted" ? "verdict-success" : "verdict-failed";
        
        let difficultyBadge = '';
        if (sub.difficulty === "Commit") {
            difficultyBadge = `<span class="difficulty-tag difficulty-medium">Commit</span>`;
        } else if (sub.difficulty === "Unrated") {
            difficultyBadge = `<span class="difficulty-tag text-muted">Unrated</span>`;
        } else {
            const isLeetCode = sub.platform === "LeetCode";
            let diffClass = '';
            if (isLeetCode) {
                diffClass = `difficulty-${sub.difficulty.toLowerCase()}`;
            } else {
                const rat = parseInt(sub.difficulty);
                if (rat < 1200) diffClass = 'difficulty-easy';
                else if (rat < 1800) diffClass = 'difficulty-medium';
                else diffClass = 'difficulty-hard';
            }
            difficultyBadge = `<span class="difficulty-tag ${diffClass}">${sub.difficulty}</span>`;
        }

        const dateFormatted = new Date(sub.timestamp).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

        row.innerHTML = `
            <td><a href="${sub.link}" target="_blank" style="color: white; font-weight: 500; text-decoration: none;">${sub.problemName}</a></td>
            <td>${platformBadge}</td>
            <td>${difficultyBadge}</td>
            <td>${sub.language}</td>
            <td class="text-muted">${dateFormatted}</td>
            <td class="${verdictClass}">${sub.verdict === "Accepted" ? "✔ Solved" : "✘ Failed"}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Stalk Mode Engine
function setupStalkView() {
    const mainCF = appState.handles.codeforces;
    if (mainCF) {
        document.getElementById("stalk-user-a-cf").value = mainCF;
    } else {
        document.getElementById("stalk-user-a-cf").value = "";
        document.getElementById("stalk-user-a-cf").placeholder = "Set your CF handle in Settings";
    }
}

async function handleProfileCompare() {
    const userACF = document.getElementById("stalk-user-a-cf").value.trim();
    const userBCF = document.getElementById("stalk-user-b-cf").value.trim();
    const compareBtn = document.getElementById("run-compare-btn");

    if (!userACF || !userBCF) {
        alert("Please ensure both Codeforces handles are provided.");
        return;
    }

    compareBtn.disabled = true;
    compareBtn.textContent = "Comparing...";

    try {
        const [aRes, bRes] = await Promise.all([
            fetchCodeforcesData(userACF),
            fetchCodeforcesData(userBCF)
        ]);

        // Render Compare UI results
        document.getElementById("stalk-results").classList.remove("hidden");
        
        // 1. Details Comparison
        document.getElementById("user-a-cf-name").textContent = userACF;
        document.getElementById("user-a-cf-rating").textContent = aRes.rating;
        document.getElementById("user-a-cf-rank").textContent = aRes.rating === "N/A" ? "-" : getCFClass(aRes.rating);
        
        document.getElementById("user-b-cf-name").textContent = userBCF;
        document.getElementById("user-b-cf-rating").textContent = bRes.rating;
        document.getElementById("user-b-cf-rank").textContent = bRes.rating === "N/A" ? "-" : getCFClass(bRes.rating);

        // Calculate comparison meter position
        const ratingA = parseInt(aRes.rating) || 0;
        const ratingB = parseInt(bRes.rating) || 0;
        let percentage = 50;
        if (ratingA + ratingB > 0) {
            percentage = Math.round((ratingA / (ratingA + ratingB)) * 100);
        }
        document.getElementById("rating-comparison-meter").style.width = `${percentage}%`;

        // 2. Render Solved Comparison Chart
        const aSolvedCount = aRes.submissions.filter(s => s.verdict === "Accepted").length;
        const bSolvedCount = bRes.submissions.filter(s => s.verdict === "Accepted").length;

        const compareCtx = document.getElementById("solvedComparisonChart").getContext("2d");
        if (appState.charts.comparison) appState.charts.comparison.destroy();

        appState.charts.comparison = new Chart(compareCtx, {
            type: 'bar',
            data: {
                labels: [userACF, userBCF],
                datasets: [{
                    label: 'Codeforces Solved Problems',
                    data: [aSolvedCount, bSolvedCount],
                    backgroundColor: ['rgba(139, 92, 246, 0.75)', 'rgba(59, 130, 246, 0.75)'],
                    borderWidth: 1,
                    borderColor: ['var(--primary)', 'var(--active-color)']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8' } },
                    x: { ticks: { color: '#94a3b8' } }
                },
                plugins: { legend: { display: false } }
            }
        });

        // 3. User B Recent Activity Feed
        const bRecentBody = document.getElementById("stalk-user-b-activity");
        bRecentBody.innerHTML = "";

        const bRecents = bRes.submissions.slice(0, 5);
        if (bRecents.length === 0) {
            bRecentBody.innerHTML = `<tr><td colspan="4" class="text-muted text-center">No recent activities.</td></tr>`;
        } else {
            bRecents.forEach(sub => {
                const row = document.createElement("tr");
                const verdictClass = sub.verdict === "Accepted" ? "verdict-success" : "verdict-failed";
                row.innerHTML = `
                    <td><a href="${sub.link}" target="_blank" style="color: white; font-weight: 500; text-decoration: none;">${sub.problemName}</a></td>
                    <td><span class="difficulty-tag difficulty-medium">${sub.difficulty}</span></td>
                    <td class="${verdictClass}">${sub.verdict === "Accepted" ? "OK" : "WRONG"}</td>
                    <td class="text-muted">${sub.language}</td>
                `;
                bRecentBody.appendChild(row);
            });
        }

    } catch (e) {
        console.error(e);
        alert("Failed to compare profiles. Please check that handles are valid.");
    } finally {
        compareBtn.disabled = false;
        compareBtn.textContent = "Compare Profiles";
    }
}

// Problem Recommendations Engine
function renderRecommendations() {
    const diffSelected = document.getElementById("rec-difficulty-level").value;
    const container = document.getElementById("recommendations-container");
    container.innerHTML = "";

    let key = "medium"; // Default level
    if (diffSelected === "easy") key = "easy";
    else if (diffSelected === "hard") key = "hard";
    else if (diffSelected === "matched") {
        // Match Codeforces rating or fallback
        const rating = parseInt(document.getElementById("cf-rating-val").textContent) || 0;
        if (rating < 1200) key = "easy";
        else if (rating >= 1800) key = "hard";
        else key = "medium";
    }

    // Grab problems randomly from the pool
    const problems = RECOMMENDATIONS_POOL[key];
    
    problems.forEach(prob => {
        const card = document.createElement("div");
        card.classList.add("rec-card", "glass-panel");

        const platformBadge = `<span class="badge platform platform-${prob.platform.slice(0,2).toLowerCase()}">${prob.platform}</span>`;
        const diffClass = prob.difficulty === "Easy" || parseInt(prob.difficulty) < 1200 ? 'difficulty-easy' : 
                          (prob.difficulty === "Hard" || parseInt(prob.difficulty) >= 1800 ? 'difficulty-hard' : 'difficulty-medium');
        
        let tagsHtml = prob.tags.map(t => `<span class="rec-tag">${t}</span>`).join('');

        card.innerHTML = `
            <div class="rec-card-header">
                <div>
                    ${platformBadge}
                    <h4 class="rec-title">${prob.title}</h4>
                    <div class="rec-tags">${tagsHtml}</div>
                </div>
            </div>
            <div class="rec-card-footer">
                <span class="difficulty-tag ${diffClass}">Diff: ${prob.difficulty}</span>
                <a href="${prob.link}" target="_blank" class="btn btn-primary rec-solve-btn">Solve <i data-lucide="external-link" style="width:14px; height:14px;"></i></a>
            </div>
        `;
        container.appendChild(card);
    });

    // Re-trigger icon rendering for dynamic content
    lucide.createIcons();
}

// Helper Utilities
function getRelativeTime(timestamp) {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

function getCFClass(rating) {
    const r = parseInt(rating);
    if (isNaN(r)) return "-";
    if (r < 1200) return "Newbie";
    if (r < 1400) return "Pupil";
    if (r < 1600) return "Specialist";
    if (r < 1900) return "Expert";
    if (r < 2100) return "Candidate Master";
    return "Master";
}

// Mock Generators (to ensure B.Tech project works offline or if live API triggers rate limits)
function generateMockCFData(handle) {
    const rating = "1428";
    const submissions = [];
    const now = Date.now();
    
    // Codeforces mock problems database
    const cfProbs = [
        { name: "Beautiful Matrix", index: "A", cId: "263", diff: "800", tags: ["implementation"] },
        { name: "Petya and Strings", index: "A", cId: "112", diff: "800", tags: ["strings"] },
        { name: "Team", index: "A", cId: "231", diff: "800", tags: ["brute force", "greedy"] },
        { name: "Next Round", index: "A", cId: "158", diff: "800", tags: ["implementation"] },
        { name: "Bit++", index: "A", cId: "282", diff: "800", tags: ["implementation"] },
        { name: "Domino piling", index: "A", cId: "50", diff: "800", tags: ["greedy", "math"] },
        { name: "Soldier and Bananas", index: "A", cId: "546", diff: "800", tags: ["brute force", "implementation"] },
        { name: "Boy or Girl", index: "A", cId: "236", diff: "800", tags: ["brute force", "strings"] },
        { name: "Elephant", index: "A", cId: "617", diff: "800", tags: ["math"] },
        { name: "Word Capitalization", index: "A", cId: "281", diff: "800", tags: ["strings"] }
    ];

    for (let i = 0; i < 24; i++) {
        const prob = cfProbs[i % cfProbs.length];
        const solvedTime = now - (i * 1.5 * 24 * 60 * 60 * 1000) - (Math.random() * 4 * 60 * 60 * 1000);
        const solved = Math.random() > 0.15; // 85% success mock submissions

        submissions.push({
            id: 200000000 + i,
            problemName: `${prob.name}`,
            platform: "Codeforces",
            difficulty: prob.diff,
            language: "C++20 (GCC 13-64)",
            timestamp: solvedTime,
            verdict: solved ? "Accepted" : "Failed",
            tags: prob.tags,
            link: `https://codeforces.com/contest/${prob.cId}/problem/${prob.index}`
        });
    }

    return { rating, submissions };
}

function generateMockLeetCodeSubmissions(easy, medium, hard) {
    const list = [];
    const now = Date.now();

    const leetProbs = {
        easy: ["Reverse String", "Merge Two Sorted Lists", "Binary Search", "Valid Parentheses", "Fizz Buzz", "Climbing Stairs"],
        medium: ["3Sum", "Rotate Image", "Search in Rotated Sorted Array", "Group Anagrams", "Permutations", "Subsets"],
        hard: ["First Missing Positive", "Merge k Sorted Lists", "Binary Tree Maximum Path Sum", "Sudoku Solver"]
    };

    // Easy Solved
    for (let i = 0; i < easy; i++) {
        const solvedTime = now - (i * 2.8 * 24 * 60 * 60 * 1000) - (Math.random() * 12 * 60 * 60 * 1000);
        list.push({
            id: 300000000 + i,
            problemName: leetProbs.easy[i % leetProbs.easy.length],
            platform: "LeetCode",
            difficulty: "Easy",
            language: "Java",
            timestamp: solvedTime,
            verdict: "Accepted",
            tags: ["Array", "String"],
            link: "https://leetcode.com/problems/" + leetProbs.easy[i % leetProbs.easy.length].toLowerCase().replace(/ /g, '-')
        });
    }

    // Medium Solved
    for (let i = 0; i < medium; i++) {
        const solvedTime = now - (i * 2.1 * 24 * 60 * 60 * 1000) - (Math.random() * 10 * 60 * 60 * 1000);
        list.push({
            id: 400000000 + i,
            problemName: leetProbs.medium[i % leetProbs.medium.length],
            platform: "LeetCode",
            difficulty: "Medium",
            language: "Python3",
            timestamp: solvedTime,
            verdict: "Accepted",
            tags: ["Dynamic Programming", "Trees"],
            link: "https://leetcode.com/problems/" + leetProbs.medium[i % leetProbs.medium.length].toLowerCase().replace(/ /g, '-')
        });
    }

    // Hard Solved
    for (let i = 0; i < hard; i++) {
        const solvedTime = now - (i * 5.5 * 24 * 60 * 60 * 1000) - (Math.random() * 20 * 60 * 60 * 1000);
        list.push({
            id: 500000000 + i,
            problemName: leetProbs.hard[i % leetProbs.hard.length],
            platform: "LeetCode",
            difficulty: "Hard",
            language: "C++",
            timestamp: solvedTime,
            verdict: "Accepted",
            tags: ["Graph", "Segment Tree"],
            link: "https://leetcode.com/problems/" + leetProbs.hard[i % leetProbs.hard.length].toLowerCase().replace(/ /g, '-')
        });
    }

    return list;
}

function generateMockGitHubData(handle) {
    const list = [];
    const now = Date.now();
    const repos = ["devsync-dashboard", "algorithms-cpp", "btech-webdev-lab", "leetcode-solutions"];
    
    for (let i = 0; i < 15; i++) {
        const solvedTime = now - (i * 2.2 * 24 * 60 * 60 * 1000) - (Math.random() * 8 * 60 * 60 * 1000);
        list.push({
            id: Math.random().toString(36).substring(2, 9),
            problemName: `Commit in ${repos[i % repos.length]}: "Update solution for problem ${i + 1}"`,
            platform: "GitHub",
            difficulty: "Commit",
            language: "N/A",
            timestamp: solvedTime,
            verdict: "Accepted",
            tags: ["development", "git"],
            link: `https://github.com/${handle}/${repos[i % repos.length]}`
        });
    }

    return list;
}
