/**
 * Main Application Bootstrap Entrypoint
 */

import { appState, loadHandlesFromStorage, saveHandlesToStorage } from './state.js';
import { fetchAnalyticsData } from './api.js';
import { renderUnifiedHeatmap } from './components/heatmap.js';
import { renderCharts } from './components/charts.js';
import { renderRecentActivities, applyFilters, renderFilteredSubmissionsTable, exportSubmissionsToCSV, exportSubmissionsToJSON } from './components/submissions.js';
import { renderRecommendations } from './components/recommendations.js';
import { handleProfileCompare } from './components/compare.js';
import { setupExporterModal } from './components/exporter.js';
import { setupPracticeTimer } from './components/timer.js';
import { renderUpcomingContests } from './components/contests.js';
import { renderLeaderboard } from './components/leaderboard.js';
import { renderBookmarks, setupBookmarkModal } from './components/bookmarks.js';

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    if (typeof lucide !== 'undefined') lucide.createIcons();

    loadHandlesFromStorage();
    setupNavigation();
    setupEventListeners();
    setupExporterModal();
    setupPracticeTimer();
    renderUpcomingContests();
    setupBookmarkModal();

    const hasAnyHandle = Object.values(appState.handles).some(h => h && h.trim().length > 0);
    if (!hasAnyHandle) {
        openSettingsModal();
    } else {
        syncAllData(false);
    }
});

function initTheme() {
    const savedTheme = localStorage.getItem("devsync_theme") || "dark";
    if (savedTheme === "light") {
        document.body.classList.add("light-theme");
        updateThemeIcon("moon");
    } else {
        document.body.classList.remove("light-theme");
        updateThemeIcon("sun");
    }
}

function toggleTheme() {
    const isLight = document.body.classList.toggle("light-theme");
    const theme = isLight ? "light" : "dark";
    localStorage.setItem("devsync_theme", theme);
    updateThemeIcon(isLight ? "moon" : "sun");
    renderCharts();
}

function updateThemeIcon(iconName) {
    const btn = document.getElementById("theme-toggle-btn");
    if (btn) {
        btn.innerHTML = `<i data-lucide="${iconName}" id="theme-icon"></i>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

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
    document.querySelectorAll(".nav-item").forEach(btn => {
        if (btn.getAttribute("data-view") === viewId) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    document.querySelectorAll(".content-view").forEach(view => {
        if (view.id === `${viewId}-view`) {
            view.classList.remove("hidden");
        } else {
            view.classList.add("hidden");
        }
    });

    const titleEl = document.getElementById("view-title");
    const subtitleEl = document.getElementById("view-subtitle");

    if (viewId === "dashboard") {
        if (titleEl) titleEl.textContent = "Dashboard";
        if (subtitleEl) subtitleEl.textContent = "Welcome back, track your progress";
    } else if (viewId === "submissions") {
        if (titleEl) titleEl.textContent = "Submissions History";
        if (subtitleEl) subtitleEl.textContent = "Search, filter, and export past platform activity";
        applyFilters();
    } else if (viewId === "contests") {
        if (titleEl) titleEl.textContent = "Upcoming Contests";
        if (subtitleEl) subtitleEl.textContent = "Live schedules for Codeforces, LeetCode, and AtCoder";
        renderUpcomingContests();
    } else if (viewId === "stalk") {
        if (titleEl) titleEl.textContent = "Competitor Benchmark";
        if (subtitleEl) subtitleEl.textContent = "Compare platform metrics side-by-side";
    } else if (viewId === "recommendations") {
        if (titleEl) titleEl.textContent = "Practice Problem Pool";
        if (subtitleEl) subtitleEl.textContent = "Tailored challenges for your current skill level";
        renderRecommendations();
    } else if (viewId === "leaderboard") {
        if (titleEl) titleEl.textContent = "Multi-Platform Leaderboard";
        if (subtitleEl) subtitleEl.textContent = "Global and friends ranking across all 7 platforms";
        renderLeaderboard();
    } else if (viewId === "bookmarks") {
        if (titleEl) titleEl.textContent = "Bookmarks & Revision Notes";
        if (subtitleEl) subtitleEl.textContent = "Saved problems and custom solution notes";
        renderBookmarks();
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function openSettingsModal() {
    const lcInput = document.getElementById("input-leetcode-handle");
    const cfInput = document.getElementById("input-codeforces-handle");
    const ghInput = document.getElementById("input-github-handle");
    const ccInput = document.getElementById("input-codechef-handle");
    const acInput = document.getElementById("input-atcoder-handle");
    const hrInput = document.getElementById("input-hackerrank-handle");
    const gfgInput = document.getElementById("input-gfg-handle");
    const modal = document.getElementById("settings-modal");

    if (lcInput) lcInput.value = appState.handles.leetcode || '';
    if (cfInput) cfInput.value = appState.handles.codeforces || '';
    if (ghInput) ghInput.value = appState.handles.github || '';
    if (ccInput) ccInput.value = appState.handles.codechef || '';
    if (acInput) acInput.value = appState.handles.atcoder || '';
    if (hrInput) hrInput.value = appState.handles.hackerrank || '';
    if (gfgInput) gfgInput.value = appState.handles.gfg || '';
    if (modal) modal.classList.add("active");
}

function closeSettingsModal() {
    const modal = document.getElementById("settings-modal");
    if (modal) modal.classList.remove("active");
}

function setupEventListeners() {
    document.getElementById("theme-toggle-btn")?.addEventListener("click", toggleTheme);
    document.getElementById("open-settings-btn")?.addEventListener("click", openSettingsModal);
    document.getElementById("close-modal-btn")?.addEventListener("click", closeSettingsModal);

    document.getElementById("handles-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const leetcode = document.getElementById("input-leetcode-handle")?.value.trim() || '';
        const codeforces = document.getElementById("input-codeforces-handle")?.value.trim() || '';
        const github = document.getElementById("input-github-handle")?.value.trim() || '';
        const codechef = document.getElementById("input-codechef-handle")?.value.trim() || '';
        const atcoder = document.getElementById("input-atcoder-handle")?.value.trim() || '';
        const hackerrank = document.getElementById("input-hackerrank-handle")?.value.trim() || '';
        const gfg = document.getElementById("input-gfg-handle")?.value.trim() || '';

        saveHandlesToStorage({ leetcode, codeforces, github, codechef, atcoder, hackerrank, gfg });
        closeSettingsModal();
        syncAllData(true);
    });

    document.getElementById("refresh-data-btn")?.addEventListener("click", () => {
        syncAllData(true);
    });

    document.getElementById("filter-platform")?.addEventListener("change", applyFilters);
    document.getElementById("filter-search")?.addEventListener("input", applyFilters);
    document.getElementById("filter-status")?.addEventListener("change", applyFilters);

    document.getElementById("export-csv-btn")?.addEventListener("click", exportSubmissionsToCSV);
    document.getElementById("export-json-btn")?.addEventListener("click", exportSubmissionsToJSON);

    document.getElementById("prev-page-btn")?.addEventListener("click", () => {
        if (appState.pagination.currentPage > 1) {
            appState.pagination.currentPage--;
            renderFilteredSubmissionsTable();
        }
    });

    document.getElementById("next-page-btn")?.addEventListener("click", () => {
        const maxPages = Math.ceil(appState.pagination.filteredItems.length / appState.pagination.itemsPerPage);
        if (appState.pagination.currentPage < maxPages) {
            appState.pagination.currentPage++;
            renderFilteredSubmissionsTable();
        }
    });

    document.getElementById("run-compare-btn")?.addEventListener("click", handleProfileCompare);
    document.getElementById("rec-difficulty-level")?.addEventListener("change", renderRecommendations);
    document.getElementById("rec-platform-filter")?.addEventListener("change", renderRecommendations);
    document.getElementById("refresh-recs-btn")?.addEventListener("click", renderRecommendations);
}

async function syncAllData(forceRefresh = false) {
    const refreshBtn = document.getElementById("refresh-data-btn");
    const refreshIcon = document.getElementById("refresh-icon");

    if (refreshBtn) refreshBtn.disabled = true;
    if (refreshIcon) refreshIcon.classList.add("animate-spin");

    const res = await fetchAnalyticsData(appState.handles);

    if (res && res.status === "success") {
        appState.totalSolved = res.stats.totalSolved || 0;
        appState.cfRating = res.stats.cfRating || "N/A";
        appState.ccRating = res.stats.ccRating || "N/A";
        appState.acRating = res.stats.acRating || "N/A";
        appState.hrRating = res.stats.hrRating || "N/A";
        appState.gfgRating = res.stats.gfgRating || "N/A";
        appState.gitCommits = res.stats.gitCommits || 0;
        appState.activeDaysCount = res.stats.activeDaysCount || 0;
        appState.submissions = res.submissions || [];

        const streak = res.stats.currentStreak !== undefined ? res.stats.currentStreak : Math.max(res.stats.activeDaysCount || 7, 7);
        const todaySolved = res.stats.todaySolvedCount || 0;
        const dailyGoal = 3;
        const goalPercent = Math.min(Math.round((todaySolved / dailyGoal) * 100), 100);

        const totalSolvedEl = document.getElementById("total-solved-val");
        const cfRatingEl = document.getElementById("cf-rating-val");
        const gitCommitsEl = document.getElementById("git-commits-val");
        const activeDaysEl = document.getElementById("active-days-val");
        const streakDaysEl = document.getElementById("streak-days-val");
        const goalTextEl = document.getElementById("goal-progress-text");
        const goalFillEl = document.getElementById("goal-progress-fill");

        if (totalSolvedEl) totalSolvedEl.textContent = appState.totalSolved;
        if (cfRatingEl) cfRatingEl.textContent = appState.cfRating;
        if (gitCommitsEl) gitCommitsEl.textContent = appState.gitCommits;
        if (activeDaysEl) activeDaysEl.textContent = appState.activeDaysCount;
        if (streakDaysEl) streakDaysEl.textContent = `${streak} Days Streak 🔥`;
        if (goalTextEl) goalTextEl.textContent = `${todaySolved} / ${dailyGoal} Problems Completed Today`;
        if (goalFillEl) goalFillEl.style.width = `${goalPercent}%`;

        renderDashboardVisuals();
    }

    setTimeout(() => {
        if (refreshBtn) refreshBtn.disabled = false;
        if (refreshIcon) refreshIcon.classList.remove("animate-spin");
    }, 600);
}

function renderDashboardVisuals() {
    renderUnifiedHeatmap();
    renderRecentActivities();
    renderCharts();
    renderUpcomingContests();
}
