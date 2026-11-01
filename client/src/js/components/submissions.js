/**
 * Submissions & Recent Activities Table Component
 */
import { appState } from '../state.js';

export function getRelativeTime(timestamp) {
    const elapsed = Date.now() - timestamp;
    const minutes = Math.floor(elapsed / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
}

function getPlatformBadgeClass(platform) {
    const clean = (platform || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.includes("leetcode")) return "platform-lc";
    if (clean.includes("codeforces")) return "platform-cf";
    if (clean.includes("github")) return "platform-gh";
    if (clean.includes("codechef")) return "platform-cc";
    if (clean.includes("atcoder")) return "platform-ac";
    if (clean.includes("hackerrank")) return "platform-hr";
    if (clean.includes("geeksforgeeks") || clean.includes("gfg")) return "platform-gfg";
    return "platform-default";
}

export function renderRecentActivities() {
    const listEl = document.getElementById("recent-activities-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    const recents = appState.submissions.slice(0, 7);
    if (recents.length === 0) {
        listEl.innerHTML = `<tr><td colspan="5" class="text-muted text-center" style="padding: 2rem;">No submission activities found. Configure your handles to sync!</td></tr>`;
        return;
    }

    recents.forEach(sub => {
        const row = document.createElement("tr");
        const badgeClass = getPlatformBadgeClass(sub.platform);
        const platformBadge = `<span class="badge platform ${badgeClass}">${sub.platform}</span>`;
        const verdictClass = sub.verdict === "Accepted" ? "verdict-success" : "verdict-failed";
        const relativeTime = getRelativeTime(sub.timestamp);

        row.innerHTML = `
            <td><a href="${sub.link}" target="_blank" class="problem-link">${sub.problemName}</a></td>
            <td>${platformBadge}</td>
            <td>${sub.language}</td>
            <td class="text-muted">${relativeTime}</td>
            <td class="${verdictClass}">${sub.verdict === "Accepted" ? "✔ Solved" : "✘ Failed"}</td>
        `;
        listEl.appendChild(row);
    });
}

export function applyFilters() {
    const platformFilter = document.getElementById("filter-platform")?.value || 'all';
    const statusFilter = document.getElementById("filter-status")?.value || 'all';
    const searchQuery = (document.getElementById("filter-search")?.value || '').toLowerCase().trim();

    appState.pagination.filteredItems = appState.submissions.filter(sub => {
        const subPlat = (sub.platform || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const matchPlatform = platformFilter === "all" || 
            subPlat.includes(platformFilter.toLowerCase().replace(/[^a-z0-9]/g, ''));
        const matchStatus = statusFilter === "all" || sub.verdict.toLowerCase() === statusFilter;
        const matchSearch = !searchQuery || 
            sub.problemName.toLowerCase().includes(searchQuery) ||
            (sub.tags && sub.tags.some(t => t.toLowerCase().includes(searchQuery)));
        return matchPlatform && matchStatus && matchSearch;
    });

    appState.pagination.currentPage = 1;
    renderFilteredSubmissionsTable();
}

export function renderFilteredSubmissionsTable() {
    const listEl = document.getElementById("submissions-full-list") || document.getElementById("full-submissions-list");
    const pageInfoEl = document.getElementById("pagination-info") || document.getElementById("page-info");
    if (!listEl) return;
    listEl.innerHTML = "";

    const { currentPage, itemsPerPage, filteredItems } = appState.pagination;
    const totalItems = filteredItems.length;

    if (totalItems === 0) {
        listEl.innerHTML = `<tr><td colspan="6" class="text-muted text-center" style="padding: 2.5rem;">No matching submissions found.</td></tr>`;
        if (pageInfoEl) pageInfoEl.textContent = "Showing 0 entries";
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);
    const maxPages = Math.ceil(totalItems / itemsPerPage);

    if (pageInfoEl) {
        pageInfoEl.textContent = `Page ${currentPage} of ${maxPages} (${totalItems} total items)`;
    }

    pageItems.forEach(sub => {
        const row = document.createElement("tr");
        const badgeClass = getPlatformBadgeClass(sub.platform);
        const platformBadge = `<span class="badge platform ${badgeClass}">${sub.platform}</span>`;
        const verdictClass = sub.verdict === "Accepted" ? "verdict-success" : "verdict-failed";
        const relativeTime = getRelativeTime(sub.timestamp);

        row.innerHTML = `
            <td><a href="${sub.link}" target="_blank" class="problem-link">${sub.problemName}</a></td>
            <td>${platformBadge}</td>
            <td><span class="badge difficulty">${sub.difficulty}</span></td>
            <td>${sub.language}</td>
            <td class="text-muted">${relativeTime}</td>
            <td class="${verdictClass}">${sub.verdict === "Accepted" ? "✔ Solved" : "✘ Failed"}</td>
        `;
        listEl.appendChild(row);
    });
}

export function exportSubmissionsToCSV() {
    const items = appState.pagination.filteredItems.length > 0 ? appState.pagination.filteredItems : appState.submissions;
    if (items.length === 0) return alert("No submission items available to export!");

    let csvContent = "data:text/csv;charset=utf-8,Problem Name,Platform,Difficulty,Language,Verdict,Submission Time,Link\n";

    items.forEach(sub => {
        const timeStr = new Date(sub.timestamp).toISOString();
        const row = `"${sub.problemName.replace(/"/g, '""')}","${sub.platform}","${sub.difficulty}","${sub.language}","${sub.verdict}","${timeStr}","${sub.link}"`;
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CodePulse_Submissions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportSubmissionsToJSON() {
    const items = appState.pagination.filteredItems.length > 0 ? appState.pagination.filteredItems : appState.submissions;
    if (items.length === 0) return alert("No submission items available to export!");

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `CodePulse_Submissions_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
