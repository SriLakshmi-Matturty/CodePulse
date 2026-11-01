/**
 * Bookmarks & Revision Notes Component
 */

const STORAGE_KEY = "codepulse_bookmarks_v1";

function getBookmarks() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) return JSON.parse(data);
    } catch (e) {}
    return [
        { id: 1, title: "Two Sum", platform: "LeetCode", category: "Interview Prep", link: "https://leetcode.com/problems/two-sum/", notes: "Hash map approach O(N) time, O(N) space. Store target - num[i] in map.", dateAdded: "2026-07-28" },
        { id: 2, title: "Kadane's Algorithm", platform: "GeeksforGeeks", category: "Must-Do DP", link: "https://www.geeksforgeeks.org/problems/kadanes-algorithm/1", notes: "Track max_so_far and max_ending_here. Reset max_ending_here to 0 if negative.", dateAdded: "2026-07-27" },
        { id: 3, title: "Single-use Attack", platform: "CodeChef", category: "Greedy Patterns", link: "https://www.codechef.com/problems/SINGLEUSE", notes: "Use special attack first if H <= Y + X * remaining.", dateAdded: "2026-07-26" }
    ];
}

function saveBookmarks(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function renderBookmarks() {
    const gridEl = document.getElementById("bookmarks-grid");
    if (!gridEl) return;

    const list = getBookmarks();
    gridEl.innerHTML = "";

    if (list.length === 0) {
        gridEl.innerHTML = `<div class="text-muted text-center" style="grid-column: 1/-1; padding: 2.5rem;">No bookmarked problems saved yet. Click "Add Problem Bookmark" to start organizing your revision notes!</div>`;
        return;
    }

    list.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("bookmark-card", "glass-panel");

        let badgeClass = "platform-lc";
        const cleanPlat = (item.platform || '').toLowerCase();
        if (cleanPlat.includes("codeforces")) badgeClass = "platform-cf";
        else if (cleanPlat.includes("codechef")) badgeClass = "platform-cc";
        else if (cleanPlat.includes("atcoder")) badgeClass = "platform-ac";
        else if (cleanPlat.includes("hackerrank")) badgeClass = "platform-hr";
        else if (cleanPlat.includes("geeksforgeeks") || cleanPlat.includes("gfg")) badgeClass = "platform-gfg";

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
                <span class="badge ${badgeClass}">${item.platform}</span>
                <span class="badge" style="background: rgba(139, 92, 246, 0.2); color: var(--purple);">${item.category || 'Revision'}</span>
            </div>
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.6rem;">${item.title}</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); background: rgba(255,255,255,0.03); padding: 0.75rem; border-radius: 8px; margin-bottom: 1.25rem; border-left: 3px solid var(--purple);">
                📝 <strong>Note:</strong> ${item.notes || 'No custom notes added.'}
            </p>
            <div style="display: flex; gap: 0.5rem;">
                <a href="${item.link}" target="_blank" class="btn btn-secondary btn-block" style="text-decoration: none; text-align: center;"><i data-lucide="external-link"></i> Solve Problem</a>
                <button class="btn btn-secondary delete-bookmark-btn" data-id="${item.id}" style="color: var(--error);" title="Remove Bookmark"><i data-lucide="trash-2"></i></button>
            </div>
        `;

        card.querySelector(".delete-bookmark-btn")?.addEventListener("click", () => {
            const updated = getBookmarks().filter(b => b.id !== item.id);
            saveBookmarks(updated);
            renderBookmarks();
        });

        gridEl.appendChild(card);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function setupBookmarkModal() {
    const addBtn = document.getElementById("open-add-bookmark-btn");
    const modal = document.getElementById("add-bookmark-modal");
    const closeBtn = document.getElementById("close-bookmark-modal-btn");
    const form = document.getElementById("add-bookmark-form");

    if (addBtn && modal) {
        addBtn.addEventListener("click", () => modal.classList.add("active"));
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener("click", () => modal.classList.remove("active"));
    }

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const title = document.getElementById("bm-title")?.value.trim();
            const platform = document.getElementById("bm-platform")?.value;
            const category = document.getElementById("bm-category")?.value.trim();
            const link = document.getElementById("bm-link")?.value.trim();
            const notes = document.getElementById("bm-notes")?.value.trim();

            if (!title) return;

            const list = getBookmarks();
            list.unshift({
                id: Date.now(),
                title,
                platform,
                category: category || "General Revision",
                link: link || "#",
                notes: notes || "Revision problem.",
                dateAdded: new Date().toISOString().split("T")[0]
            });

            saveBookmarks(list);
            modal.classList.remove("active");
            form.reset();
            renderBookmarks();
        });
    }
}
