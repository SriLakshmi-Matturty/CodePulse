/**
 * Live Upcoming Contests Component - 6 Platform Support & Calendar Reminders
 */

let allContestsData = [];

function getDefaultContestsSchedule() {
    const now = Date.now();
    const hour = 3600 * 1000;
    const day = 24 * hour;

    return [
        {
            name: "CodeChef Starters 148 (Rated for All)",
            platform: "CodeChef",
            startTime: now + (2 * day + 4 * hour),
            duration: "2 Hours",
            link: "https://www.codechef.com/contests"
        },
        {
            name: "HackerRank Monthly CodeSprint",
            platform: "HackerRank",
            startTime: now + (4 * day + 2 * hour),
            duration: "3 Hours",
            link: "https://www.hackerrank.com/contests"
        },
        {
            name: "GFG Weekly Coding Contest 165",
            platform: "GeeksforGeeks",
            startTime: now + (5 * day + 6 * hour),
            duration: "1.5 Hours",
            link: "https://practice.geeksforgeeks.org/events/rec/gfg-weekly-coding-contest"
        },
        {
            name: "LeetCode Weekly Contest 412",
            platform: "LeetCode",
            startTime: now + (3 * day + 5 * hour),
            duration: "1.5 Hours",
            link: "https://leetcode.com/contest/"
        },
        {
            name: "Codeforces Round 965 (Div. 2)",
            platform: "Codeforces",
            startTime: now + (1 * day + 8 * hour),
            duration: "2 Hours",
            link: "https://codeforces.com/contests"
        },
        {
            name: "AtCoder Beginner Contest 368",
            platform: "AtCoder",
            startTime: now + (3 * day + 10 * hour),
            duration: "100 Mins",
            link: "https://atcoder.jp/contests/"
        }
    ];
}

function mergeContestsWithDefaults(fetchedContests) {
    const defaults = getDefaultContestsSchedule();
    const result = [...fetchedContests];

    const platformsInFetched = new Set(fetchedContests.map(c => (c.platform || '').toLowerCase().replace(/[^a-z]/g, '')));

    defaults.forEach(def => {
        const defPlat = def.platform.toLowerCase().replace(/[^a-z]/g, '');
        const hasPlatform = Array.from(platformsInFetched).some(p => p.includes(defPlat) || defPlat.includes(p));
        if (!hasPlatform) {
            result.push(def);
        }
    });

    return result;
}

export async function renderUpcomingContests() {
    setupContestTabListeners();

    try {
        const apiUrl = window.location.origin.includes('5000') 
            ? '/api/contests' 
            : 'http://localhost:5000/api/contests';
            
        const res = await fetch(apiUrl);
        if (res.ok) {
            const data = await res.json();
            if (data && data.status === "success" && Array.isArray(data.contests) && data.contests.length > 0) {
                allContestsData = mergeContestsWithDefaults(data.contests);
            } else {
                allContestsData = getDefaultContestsSchedule();
            }
        } else {
            allContestsData = getDefaultContestsSchedule();
        }
    } catch (error) {
        console.warn("Failed to fetch live contest schedule. Activating fallback contest schedule...", error);
        allContestsData = getDefaultContestsSchedule();
    }

    renderContestsByPlatform(allContestsData);
}

function setupContestTabListeners() {
    const tabBtns = document.querySelectorAll(".contest-tab-btn");
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => {
                b.classList.remove("active", "btn-primary");
                b.classList.add("btn-secondary");
            });
            btn.classList.add("active", "btn-primary");
            btn.classList.remove("btn-secondary");

            const platform = btn.getAttribute("data-platform");
            filterContestSections(platform);
        });
    });
}

function filterContestSections(platform) {
    const sections = {
        codeforces: document.getElementById("section-codeforces"),
        leetcode: document.getElementById("section-leetcode"),
        atcoder: document.getElementById("section-atcoder"),
        codechef: document.getElementById("section-codechef"),
        hackerrank: document.getElementById("section-hackerrank"),
        geeksforgeeks: document.getElementById("section-geeksforgeeks")
    };

    Object.keys(sections).forEach(key => {
        const sec = sections[key];
        if (!sec) return;
        if (platform === "all" || platform === key) {
            sec.classList.remove("hidden");
        } else {
            sec.classList.add("hidden");
        }
    });
}

function renderContestsByPlatform(contests) {
    const cfList = document.getElementById("contests-list-codeforces");
    const lcList = document.getElementById("contests-list-leetcode");
    const atList = document.getElementById("contests-list-atcoder");
    const ccList = document.getElementById("contests-list-codechef");
    const hrList = document.getElementById("contests-list-hackerrank");
    const gfgList = document.getElementById("contests-list-geeksforgeeks");

    if (cfList) cfList.innerHTML = "";
    if (lcList) lcList.innerHTML = "";
    if (atList) atList.innerHTML = "";
    if (ccList) ccList.innerHTML = "";
    if (hrList) hrList.innerHTML = "";
    if (gfgList) gfgList.innerHTML = "";

    const cfItems = contests.filter(c => c.platform.toLowerCase().includes("codeforces"));
    const lcItems = contests.filter(c => c.platform.toLowerCase().includes("leetcode"));
    const atItems = contests.filter(c => c.platform.toLowerCase().includes("atcoder"));
    const ccItems = contests.filter(c => c.platform.toLowerCase().includes("codechef"));
    const hrItems = contests.filter(c => c.platform.toLowerCase().includes("hackerrank"));
    const gfgItems = contests.filter(c => c.platform.toLowerCase().includes("geeksforgeeks") || c.platform.toLowerCase().includes("gfg"));

    renderGridItems(cfList, cfItems, "Codeforces", "platform-cf");
    renderGridItems(lcList, lcItems, "LeetCode", "platform-lc");
    renderGridItems(atList, atItems, "AtCoder", "platform-ac");
    renderGridItems(ccList, ccItems, "CodeChef", "platform-cc");
    renderGridItems(hrList, hrItems, "HackerRank", "platform-hr");
    renderGridItems(gfgList, gfgItems, "GeeksforGeeks", "platform-gfg");
}

function getGoogleCalendarUrl(name, startTime, link) {
    const startIso = new Date(startTime).toISOString().replace(/-|:|\.\d+/g, '');
    const endIso = new Date(startTime + 2 * 3600 * 1000).toISOString().replace(/-|:|\.\d+/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(name)}&dates=${startIso}/${endIso}&details=${encodeURIComponent('CodePulse Contest Link: ' + link)}`;
}

function downloadIcsFile(name, startTime, link) {
    const startStr = new Date(startTime).toISOString().replace(/-|:|\.\d+/g, '');
    const endStr = new Date(startTime + 2 * 3600 * 1000).toISOString().replace(/-|:|\.\d+/g, '');
    const icsData = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `SUMMARY:${name}`,
        `DTSTART:${startStr}`,
        `DTEND:${endStr}`,
        `DESCRIPTION:Coding Contest on CodePulse: ${link}`,
        `URL:${link}`,
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const linkEl = document.createElement("a");
    linkEl.href = URL.createObjectURL(blob);
    linkEl.download = `${name.replace(/[^a-z0-9]/gi, '_')}.ics`;
    linkEl.click();
}

function renderGridItems(containerEl, items, platformName, badgeClass) {
    if (!containerEl) return;
    if (items.length === 0) {
        containerEl.innerHTML = `<div class="text-muted" style="padding: 1.5rem; grid-column: 1/-1; background: var(--bg-card); border-radius: 14px; text-align: center;">No upcoming ${platformName} contests currently scheduled. Check back soon!</div>`;
        return;
    }

    items.forEach((c, idx) => {
        const card = document.createElement("div");
        card.classList.add("contest-card", "glass-panel");

        const diffMs = c.startTime - Date.now();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const countdownStr = hours > 24 
            ? `In ${Math.floor(hours / 24)}d ${hours % 24}h` 
            : (hours > 0 ? `In ${hours}h ${mins}m` : `In ${Math.max(mins, 1)}m`);

        const gCalUrl = getGoogleCalendarUrl(c.name, c.startTime, c.link);

        card.innerHTML = `
            <div class="contest-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
                <span class="badge ${badgeClass}">${c.platform}</span>
                <span class="badge" style="background: rgba(6, 182, 212, 0.2); color: var(--cyan); border: 1px solid rgba(6, 182, 212, 0.4);">${countdownStr}</span>
            </div>
            <h4 style="font-size: 1.05rem; margin-bottom: 0.6rem; font-weight: 700; line-height: 1.3; color: var(--text-primary);">${c.name}</h4>
            <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>⏱ Duration: ${c.duration || '2 Hours'}</span>
                    <a href="${c.link}" target="_blank" class="btn btn-primary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; text-decoration: none;"><i data-lucide="external-link"></i> Register</a>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <a href="${gCalUrl}" target="_blank" class="btn btn-secondary btn-block" style="padding: 0.3rem 0.5rem; font-size: 0.75rem; text-decoration: none; text-align: center;">📅 Google Cal</a>
                    <button class="btn btn-secondary btn-block download-ics-btn" data-name="${c.name}" data-start="${c.startTime}" data-link="${c.link}" style="padding: 0.3rem 0.5rem; font-size: 0.75rem;">📥 .ICS File</button>
                </div>
            </div>
        `;

        card.querySelector('.download-ics-btn')?.addEventListener('click', (e) => {
            const btn = e.currentTarget;
            downloadIcsFile(btn.getAttribute('data-name'), parseInt(btn.getAttribute('data-start')), btn.getAttribute('data-link'));
        });

        containerEl.appendChild(card);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}
