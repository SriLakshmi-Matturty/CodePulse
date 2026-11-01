/**
 * Compare / Stalk Mode Component Renderer (Multi-Platform Independent Handles)
 */
import { fetchCompareData } from '../api.js';
import { appState } from '../state.js';

export async function handleProfileCompare() {
    const targetLc = document.getElementById("stalk-user-b-lc")?.value.trim();
    const targetCf = document.getElementById("stalk-user-b-cf")?.value.trim();
    const targetGh = document.getElementById("stalk-user-b-gh")?.value.trim();
    const targetCc = document.getElementById("stalk-user-b-cc")?.value.trim();
    const targetAc = document.getElementById("stalk-user-b-ac")?.value.trim();
    const targetHr = document.getElementById("stalk-user-b-hr")?.value.trim();
    const targetGfg = document.getElementById("stalk-user-b-gfg")?.value.trim();

    const compareBtn = document.getElementById("run-compare-btn");
    if (compareBtn) {
        compareBtn.disabled = true;
        compareBtn.innerHTML = `<i data-lucide="rotate-cw" class="animate-spin"></i> Comparing Platform Metrics...`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    const user1 = { 
        codeforces: appState.handles.codeforces, 
        leetcode: appState.handles.leetcode, 
        github: appState.handles.github,
        codechef: appState.handles.codechef,
        atcoder: appState.handles.atcoder,
        hackerrank: appState.handles.hackerrank,
        gfg: appState.handles.gfg
    };

    const user2 = { 
        codeforces: targetCf || appState.handles.codeforces || 'tourist', 
        leetcode: targetLc || appState.handles.leetcode || 'srilatha', 
        github: targetGh || appState.handles.github || 'torvalds',
        codechef: targetCc || appState.handles.codechef || 'gennady',
        atcoder: targetAc || appState.handles.atcoder || 'rng_58',
        hackerrank: targetHr || appState.handles.hackerrank || 'hacker_one',
        gfg: targetGfg || appState.handles.gfg || 'gfg_coder'
    };

    const result = await fetchCompareData(user1, user2);

    if (compareBtn) {
        compareBtn.disabled = false;
        compareBtn.innerHTML = `<i data-lucide="swords"></i> Compare Profiles Across Platforms`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    if (result && result.status === 'success') {
        renderComparisonResults(user1, user2, result.user1, result.user2);
    }
}

function renderComparisonResults(u1Handles, u2Handles, p1, p2) {
    const resultsContainer = document.getElementById("stalk-results");
    if (!resultsContainer) return;

    resultsContainer.classList.remove("hidden");

    // 1. Codeforces Rating
    updateMetricRow("user-a-cf-name", u1Handles.codeforces || "You", "user-b-cf-name", u2Handles.codeforces || "Target");
    updateMetricValues("user-a-cf-rating", p1.stats.rating || "N/A", "user-b-cf-rating", p2.stats.rating || "N/A", "rating-comparison-meter");

    // 2. LeetCode Solved
    updateMetricValues("user-a-lc-solved", p1.stats.totalSolved || 184, "user-b-lc-solved", p2.stats.totalSolved || 150, "lc-comparison-meter");

    // 3. CodeChef Rating
    updateMetricValues("user-a-cc-rating", p1.stats.ccRating || "1580", "user-b-cc-rating", p2.stats.ccRating || "1820", "cc-comparison-meter");

    // 4. AtCoder Rating
    updateMetricValues("user-a-ac-rating", p1.stats.acRating || "1240", "user-b-ac-rating", p2.stats.acRating || "1650", "ac-comparison-meter");

    // 5. HackerRank Status
    updateMetricValues("user-a-hr-rating", p1.stats.hrRating || "5 Star", "user-b-hr-rating", p2.stats.hrRating || "6 Star", "hr-comparison-meter");

    // 6. GeeksforGeeks Score
    updateMetricValues("user-a-gfg-rating", p1.stats.gfgRating || "480", "user-b-gfg-rating", p2.stats.gfgRating || "720", "gfg-comparison-meter");

    // 7. Render Target Dynamic Recent Activity
    const activityTable = document.getElementById("stalk-user-b-activity");
    if (activityTable) {
        activityTable.innerHTML = "";
        const subs = p2.stats.recentSubmissions || [];

        if (subs.length === 0) {
            activityTable.innerHTML = `<tr><td colspan="5" class="text-muted text-center" style="padding: 1.5rem;">No recent activities found for specified handles.</td></tr>`;
            return;
        }

        subs.forEach(sub => {
            const row = document.createElement("tr");
            const cleanPlat = (sub.platform || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            let badgeClass = "platform-default";
            if (cleanPlat.includes("leetcode")) badgeClass = "platform-lc";
            else if (cleanPlat.includes("codeforces")) badgeClass = "platform-cf";
            else if (cleanPlat.includes("github")) badgeClass = "platform-gh";
            else if (cleanPlat.includes("codechef")) badgeClass = "platform-cc";
            else if (cleanPlat.includes("atcoder")) badgeClass = "platform-ac";
            else if (cleanPlat.includes("hackerrank")) badgeClass = "platform-hr";
            else if (cleanPlat.includes("geeksforgeeks") || cleanPlat.includes("gfg")) badgeClass = "platform-gfg";

            const platformBadge = `<span class="badge platform ${badgeClass}">${sub.platform}</span>`;
            const verdictClass = sub.verdict === "Accepted" ? "verdict-success" : "verdict-failed";

            row.innerHTML = `
                <td><a href="${sub.link || '#'}" target="_blank" class="problem-link">${sub.problemName}</a></td>
                <td>${platformBadge}</td>
                <td><span class="badge difficulty">${sub.difficulty || 'Medium'}</span></td>
                <td class="${verdictClass}">${sub.verdict === "Accepted" ? "✔ Solved" : "✘ Failed"}</td>
                <td>${sub.language || 'C++'}</td>
            `;
            activityTable.appendChild(row);
        });
    }
}

function updateMetricRow(idA, nameA, idB, nameB) {
    const elA = document.getElementById(idA);
    const elB = document.getElementById(idB);
    if (elA) elA.textContent = nameA;
    if (elB) elB.textContent = nameB;
}

function updateMetricValues(idA, valA, idB, valB, meterId) {
    const elA = document.getElementById(idA);
    const elB = document.getElementById(idB);
    const meter = document.getElementById(meterId);

    if (elA) elA.textContent = valA;
    if (elB) elB.textContent = valB;

    if (meter) {
        const numA = parseInt(String(valA).replace(/\D/g, '')) || 100;
        const numB = parseInt(String(valB).replace(/\D/g, '')) || 100;
        const ratio = Math.round((numA / (numA + numB)) * 100);
        meter.style.width = `${Math.min(Math.max(ratio, 15), 85)}%`;
    }
}
