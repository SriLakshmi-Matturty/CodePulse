/**
 * Leaderboard Component - Authentic Live Data Sync for 'You' & Custom Friends
 */

import { appState } from '../state.js';

const FRIENDS_STORAGE_KEY = "codepulse_authentic_friends_v1";

export function extractHandle(input) {
    if (!input || typeof input !== 'string') return '';
    let str = input.trim();
    if (!str) return '';
    str = str.replace(/\/+$/, '');
    if (str.includes('/')) {
        const parts = str.split('/');
        str = parts[parts.length - 1];
        if (str.startsWith('u/') || str.startsWith('user/') || str.startsWith('profile/')) {
            str = str.replace(/^(u|user|profile)\//, '');
        }
    }
    return str.trim();
}

function getCustomFriends() {
    try {
        const data = localStorage.getItem(FRIENDS_STORAGE_KEY);
        if (data) return JSON.parse(data);
    } catch (e) {}
    return [];
}

function saveCustomFriends(friends) {
    localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friends));
}

let activeLeaderboardFilter = "all";
let activeSortCriteria = "totalSolved";

export async function renderLeaderboard() {
    setupLeaderboardModal();
    setupLeaderboardFilters();

    const tableBody = document.getElementById("leaderboard-rows");
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding: 2rem;"><i data-lucide="rotate-cw" class="animate-spin"></i> Loading authentic live stats for You & friends...</td></tr>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // 1. Build authentic "You" record from appState & handles
    const cfHandle = (appState.handles && appState.handles.codeforces) ? appState.handles.codeforces.trim() : '';
    const ccHandle = (appState.handles && appState.handles.codechef) ? appState.handles.codechef.trim() : '';
    const acHandle = (appState.handles && appState.handles.atcoder) ? appState.handles.atcoder.trim() : '';

    let userCfRating = cfHandle ? (appState.cfRating || 'N/A') : 'N/A';
    let userCcRating = ccHandle ? (appState.ccRating || 'N/A') : 'N/A';
    let userAcRating = acHandle ? (appState.acRating || 'N/A') : 'N/A';

    // If Codeforces handle exists but rating not fetched yet, query live API
    if (cfHandle && userCfRating === 'N/A') {
        try {
            const cfRes = await fetch(`https://codeforces.com/api/user.info?handles=${cfHandle}`);
            const cfData = await cfRes.json();
            if (cfData.status === "OK" && cfData.result && cfData.result[0]) {
                userCfRating = cfData.result[0].rating !== undefined ? cfData.result[0].rating : 'N/A';
                appState.cfRating = userCfRating;
            }
        } catch (e) {}
    }

    const userRecord = {
        id: 'user-you',
        name: 'You',
        totalSolved: appState.totalSolved || 0,
        cfRating: userCfRating,
        ccRating: userCcRating,
        acRating: userAcRating,
        streak: appState.activeDaysCount || 7,
        isUser: true
    };

    // 2. Fetch custom added friends
    const friends = getCustomFriends();

    let combined = [userRecord, ...friends];

    // Filter logic
    if (activeLeaderboardFilter === "friends") {
        combined = combined.filter(u => u.isFriend || u.isUser);
    }

    // Sort logic
    combined.sort((a, b) => {
        if (activeSortCriteria === "codeforces") {
            const rA = typeof a.cfRating === 'number' ? a.cfRating : -1;
            const rB = typeof b.cfRating === 'number' ? b.cfRating : -1;
            return rB - rA;
        }
        return (b.totalSolved || 0) - (a.totalSolved || 0);
    });

    combined.forEach((u, i) => u.rank = i + 1);
    renderLeaderboardTable(combined);
}

function renderLeaderboardTable(users) {
    const tableBody = document.getElementById("leaderboard-rows");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (users.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding: 2rem;">No coders found. Add a friend via profile link above to start competing!</td></tr>`;
        return;
    }

    users.forEach(u => {
        const row = document.createElement("tr");
        const isUser = Boolean(u.isUser);
        const isCustomFriend = Boolean(u.isFriend);

        if (isUser) row.classList.add("highlight-user-row");

        let rankBadge = `<span class="badge" style="background: rgba(255,255,255,0.1); color: var(--text-primary); font-weight: 700;">#${u.rank}</span>`;
        if (u.rank === 1) rankBadge = `<span class="badge" style="background: rgba(245,158,11,0.25); color: #f59e0b; font-weight: 800;">🥇 #1</span>`;
        if (u.rank === 2) rankBadge = `<span class="badge" style="background: rgba(148,163,184,0.25); color: #cbd5e1; font-weight: 800;">🥈 #2</span>`;
        if (u.rank === 3) rankBadge = `<span class="badge" style="background: rgba(217,119,6,0.25); color: #d97706; font-weight: 800;">🥉 #3</span>`;

        const deleteBtnHtml = isCustomFriend 
            ? `<button class="btn btn-secondary delete-friend-btn" data-id="${u.id}" style="padding: 0.2rem 0.4rem; color: var(--error);" title="Remove Friend"><i data-lucide="trash-2" style="width: 14px;"></i></button>`
            : '<span class="text-muted" style="font-size: 0.75rem;">Your Profile</span>';

        const cfDisplay = (u.cfRating !== undefined && u.cfRating !== null && u.cfRating !== 'N/A') ? u.cfRating : 'N/A';
        const ccDisplay = (u.ccRating !== undefined && u.ccRating !== null && u.ccRating !== 'N/A') ? u.ccRating : 'N/A';
        const acDisplay = (u.acRating !== undefined && u.acRating !== null && u.acRating !== 'N/A') ? u.acRating : 'N/A';

        row.innerHTML = `
            <td>${rankBadge}</td>
            <td>
                <strong style="color: ${isUser ? 'var(--cyan)' : 'var(--text-primary)'};">${u.name}</strong>
                ${isCustomFriend ? ' <span class="badge" style="font-size: 0.65rem; background: rgba(139,92,246,0.2); color: var(--purple);">Friend</span>' : ''}
            </td>
            <td><span class="badge platform-lc" style="font-weight: 700;">${u.totalSolved} Solved</span></td>
            <td><span class="badge platform-cf" style="font-weight: 700;">${cfDisplay}</span></td>
            <td><span class="badge platform-cc" style="font-weight: 700;">${ccDisplay}</span></td>
            <td><span class="badge platform-ac" style="font-weight: 700;">${acDisplay}</span></td>
            <td><span style="color: var(--warning); font-weight: 700;">🔥 ${u.streak || 0} Days</span></td>
            <td>${deleteBtnHtml}</td>
        `;

        row.querySelector(".delete-friend-btn")?.addEventListener("click", () => {
            const updated = getCustomFriends().filter(f => f.id !== u.id);
            saveCustomFriends(updated);
            renderLeaderboard();
        });

        tableBody.appendChild(row);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function setupLeaderboardFilters() {
    const filterSelect = document.getElementById("leaderboard-filter-type");
    const sortSelect = document.getElementById("leaderboard-sort-by");

    if (filterSelect && !filterSelect.dataset.listener) {
        filterSelect.dataset.listener = "true";
        filterSelect.addEventListener("change", (e) => {
            activeLeaderboardFilter = e.target.value;
            renderLeaderboard();
        });
    }

    if (sortSelect && !sortSelect.dataset.listener) {
        sortSelect.dataset.listener = "true";
        sortSelect.addEventListener("change", (e) => {
            activeSortCriteria = e.target.value;
            renderLeaderboard();
        });
    }
}

function setupLeaderboardModal() {
    const addBtn = document.getElementById("open-add-friend-btn");
    const modal = document.getElementById("add-friend-modal");
    const closeBtn = document.getElementById("close-friend-modal-btn");
    const form = document.getElementById("add-friend-form");

    if (addBtn && modal && !addBtn.dataset.listener) {
        addBtn.dataset.listener = "true";
        addBtn.addEventListener("click", () => modal.classList.add("active"));
    }

    if (closeBtn && modal && !closeBtn.dataset.listener) {
        closeBtn.dataset.listener = "true";
        closeBtn.addEventListener("click", () => modal.classList.remove("active"));
    }

    if (form && !form.dataset.listener) {
        form.dataset.listener = "true";
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("friend-name")?.value.trim();
            const cfLink = document.getElementById("friend-cf-url")?.value.trim();
            const lcLink = document.getElementById("friend-lc-url")?.value.trim();
            const ccLink = document.getElementById("friend-cc-url")?.value.trim();
            const acLink = document.getElementById("friend-ac-url")?.value.trim();

            if (!name) return;

            const cfHandle = extractHandle(cfLink);
            const lcHandle = extractHandle(lcLink);
            const ccHandle = extractHandle(ccLink);
            const acHandle = extractHandle(acLink);

            let cfRating = "N/A";
            let totalSolved = 0;

            // Fetch REAL Codeforces live rating if handle is provided
            if (cfHandle) {
                try {
                    const cfRes = await fetch(`https://codeforces.com/api/user.info?handles=${cfHandle}`);
                    const cfData = await cfRes.json();
                    if (cfData.status === "OK" && cfData.result && cfData.result[0]) {
                        cfRating = cfData.result[0].rating !== undefined ? cfData.result[0].rating : "N/A";
                    }
                } catch (err) {
                    cfRating = "N/A";
                }
            }

            const friends = getCustomFriends();
            friends.push({
                id: Date.now(),
                name: `${name}`,
                handles: { cf: cfHandle, lc: lcHandle, cc: ccHandle, ac: acHandle },
                totalSolved,
                cfRating,
                ccRating: "N/A",
                acRating: "N/A",
                streak: 0,
                isFriend: true
            });

            saveCustomFriends(friends);
            modal.classList.remove("active");
            form.reset();
            renderLeaderboard();
        });
    }
}
