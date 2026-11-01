/**
 * Reactive Application State Store
 */

export const appState = {
    handles: {
        leetcode: '',
        codeforces: '',
        github: '',
        codechef: '',
        atcoder: '',
        hackerrank: '',
        gfg: ''
    },
    syncTime: null,
    totalSolved: 0,
    activeDaysCount: 0,
    cfRating: "N/A",
    ccRating: "N/A",
    acRating: "N/A",
    hrRating: "N/A",
    gfgRating: "N/A",
    gitCommits: 0,
    submissions: [],
    charts: {
        difficulty: null,
        platform: null,
        radar: null,
        comparison: null
    },
    pagination: {
        currentPage: 1,
        itemsPerPage: 10,
        filteredItems: []
    }
};

export function loadHandlesFromStorage() {
    const saved = localStorage.getItem("devsync_user_handles");
    if (saved) {
        try {
            appState.handles = { ...appState.handles, ...JSON.parse(saved) };
        } catch (e) {
            console.error("Error parsing user handles:", e);
        }
    }
}

export function saveHandlesToStorage(handles) {
    appState.handles = { ...appState.handles, ...handles };
    localStorage.setItem("devsync_user_handles", JSON.stringify(appState.handles));
}
