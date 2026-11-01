/**
 * Chart.js Visualizations, Difficulty Matrix & Topic Skills Radar Component
 */
import { appState } from '../state.js';

export function renderCharts() {
    // 1. Calculate difficulty counts
    let easyCount = 0, mediumCount = 0, hardCount = 0;

    // Topic counts for Radar Chart
    const topicCounts = {
        "DP": 12,
        "Binary Search": 18,
        "Hash Table": 24,
        "Strings": 15,
        "Trees/Graphs": 9,
        "Math": 14
    };

    appState.submissions.forEach(sub => {
        if (sub.platform === "GitHub") return;
        const diff = (sub.difficulty || '').toLowerCase();
        if (diff === "easy" || (parseInt(diff) > 0 && parseInt(diff) < 1200)) {
            easyCount++;
        } else if (diff === "medium" || (parseInt(diff) >= 1200 && parseInt(diff) < 1800)) {
            mediumCount++;
        } else if (diff === "hard" || parseInt(diff) >= 1800) {
            hardCount++;
        }

        // Increment topic counts if tags match
        (sub.tags || []).forEach(t => {
            const tagLower = t.toLowerCase();
            if (tagLower.includes("dp")) topicCounts["DP"]++;
            if (tagLower.includes("binary") || tagLower.includes("search")) topicCounts["Binary Search"]++;
            if (tagLower.includes("string")) topicCounts["Strings"]++;
            if (tagLower.includes("math")) topicCounts["Math"]++;
            if (tagLower.includes("hash")) topicCounts["Hash Table"]++;
            if (tagLower.includes("tree") || tagLower.includes("graph")) topicCounts["Trees/Graphs"]++;
        });
    });

    // Default counts if 0
    if (easyCount === 0 && mediumCount === 0 && hardCount === 0) {
        easyCount = 57;
        mediumCount = 105;
        hardCount = 22;
    }

    // Update Difficulty Matrix Cards in DOM
    const easyValEl = document.getElementById("easy-count-val");
    const medValEl = document.getElementById("medium-count-val");
    const hardValEl = document.getElementById("hard-count-val");

    if (easyValEl) easyValEl.textContent = easyCount;
    if (medValEl) medValEl.textContent = mediumCount;
    if (hardValEl) hardValEl.textContent = hardCount;

    if (typeof Chart === 'undefined') return;

    // Theme color helper
    const isLight = document.body.classList.contains("light-theme");
    const textColor = isLight ? '#0f172a' : '#94a3b8';
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)';

    // Chart 1: Donut Difficulty Chart
    const diffCanvas = document.getElementById("difficultyChart");
    if (diffCanvas) {
        const diffCtx = diffCanvas.getContext("2d");
        if (appState.charts.difficulty) appState.charts.difficulty.destroy();
        
        appState.charts.difficulty = new Chart(diffCtx, {
            type: 'doughnut',
            data: {
                labels: ['Easy', 'Medium', 'Hard'],
                datasets: [{
                    data: [easyCount, mediumCount, hardCount],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 2,
                    borderColor: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.8)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 12 } }
                    }
                },
                cutout: '70%'
            }
        });
    }

    // Chart 2: Expanded 7-Platform Breakdown Bar Chart
    let cfCount = 0, lcCount = 0, ghCount = 0, ccCount = 0, acCount = 0, hrCount = 0, gfgCount = 0;
    appState.submissions.forEach(sub => {
        const p = (sub.platform || '').toLowerCase();
        if (p.includes("codeforces")) cfCount++;
        else if (p.includes("leetcode")) lcCount++;
        else if (p.includes("github")) ghCount++;
        else if (p.includes("codechef")) ccCount++;
        else if (p.includes("atcoder")) acCount++;
        else if (p.includes("hackerrank")) hrCount++;
        else if (p.includes("geeksforgeeks") || p.includes("gfg")) gfgCount++;
    });

    if (lcCount === 0) lcCount = Math.max(appState.totalSolved - cfCount - ccCount, 15);

    const platformCanvas = document.getElementById("platformChart");
    if (platformCanvas) {
        const platformCtx = platformCanvas.getContext("2d");
        if (appState.charts.platform) appState.charts.platform.destroy();

        appState.charts.platform = new Chart(platformCtx, {
            type: 'bar',
            data: {
                labels: ['Codeforces', 'LeetCode', 'GitHub', 'CodeChef', 'AtCoder', 'HackerRank', 'GFG'],
                datasets: [{
                    label: 'Submissions & Activity',
                    data: [
                        cfCount || 12,
                        lcCount || 24,
                        ghCount || appState.gitCommits || 15,
                        ccCount || 10,
                        acCount || 6,
                        hrCount || 8,
                        gfgCount || 9
                    ],
                    backgroundColor: [
                        '#ff4757', // Codeforces
                        '#ffa502', // LeetCode
                        '#2ed573', // GitHub
                        '#8b5cf6', // CodeChef
                        '#00d2d3', // AtCoder
                        '#2ec4b6', // HackerRank
                        '#2f9e44'  // GFG
                    ],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor, font: { size: 10 } }
                    }
                }
            }
        });
    }

    // Chart 3: Topic Skills Radar Chart
    const radarCanvas = document.getElementById("radarChart");
    if (radarCanvas) {
        const radarCtx = radarCanvas.getContext("2d");
        if (appState.charts.radar) appState.charts.radar.destroy();

        appState.charts.radar = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: Object.keys(topicCounts),
                datasets: [{
                    label: 'Skill Proficiency',
                    data: Object.values(topicCounts),
                    backgroundColor: 'rgba(139, 92, 246, 0.25)',
                    borderColor: '#8b5cf6',
                    pointBackgroundColor: '#06b6d4',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    r: {
                        angleLines: { color: gridColor },
                        grid: { color: gridColor },
                        pointLabels: { color: textColor, font: { size: 11, family: 'Plus Jakarta Sans' } },
                        ticks: { display: false }
                    }
                }
            }
        });
    }
}
