/**
 * Smart Recommendations Component Renderer - Multi-Platform Support, Filtering & Skill Growth
 */
import { fetchRecommendationsData } from '../api.js';

function getPlatformBadgeClass(platform) {
    const clean = (platform || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.includes("leetcode")) return "platform-lc";
    if (clean.includes("codeforces")) return "platform-cf";
    if (clean.includes("codechef")) return "platform-cc";
    if (clean.includes("atcoder")) return "platform-ac";
    if (clean.includes("hackerrank")) return "platform-hr";
    if (clean.includes("geeksforgeeks") || clean.includes("gfg")) return "platform-gfg";
    return "platform-default";
}

export async function renderRecommendations() {
    renderTopicSkillGrowth();

    const gridEl = document.getElementById("recommendations-container") || document.getElementById("recommendations-grid");
    if (!gridEl) return;

    const levelSelect = document.getElementById("rec-difficulty-level");
    const platformSelect = document.getElementById("rec-platform-filter");

    const level = levelSelect ? levelSelect.value : "matched";
    const selectedPlatform = platformSelect ? platformSelect.value.toLowerCase().replace(/[^a-z0-9]/g, '') : "all";

    gridEl.innerHTML = `<div class="loading-state" style="padding: 2rem; text-align: center; grid-column: 1/-1;"><i data-lucide="rotate-cw" class="animate-spin"></i> Finding problem recommendations...</div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    let problems = await fetchRecommendationsData(level);

    if (selectedPlatform !== "all") {
        problems = problems.filter(p => {
            const cleanPlat = (p.platform || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            return cleanPlat.includes(selectedPlatform);
        });
    }

    gridEl.innerHTML = "";

    if (problems.length === 0) {
        gridEl.innerHTML = `<div class="text-muted text-center" style="grid-column: 1/-1; padding: 2rem;">No problem recommendations found for selected filters. Try choosing "All Platforms" or refreshing!</div>`;
        return;
    }

    problems.forEach(prob => {
        const card = document.createElement("div");
        card.classList.add("recommendation-card", "glass-panel");

        const badgeClass = getPlatformBadgeClass(prob.platform);
        const tagsHtml = (prob.tags || [])
            .map(t => `<span class="tag-pill">${t}</span>`)
            .join("");

        card.innerHTML = `
            <div class="card-header" style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                <span class="badge ${badgeClass}">${prob.platform}</span>
                <span class="badge difficulty">${prob.difficulty}</span>
            </div>
            <h3 class="problem-title" style="font-size: 1.1rem; margin-bottom: 0.75rem;">${prob.title}</h3>
            <div class="tags-container" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem;">${tagsHtml}</div>
            <a href="${prob.link}" target="_blank" class="solve-btn btn btn-secondary btn-block" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                <span>Solve Challenge</span>
                <i data-lucide="external-link"></i>
            </a>
        `;
        gridEl.appendChild(card);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderTopicSkillGrowth() {
    const skillContainer = document.getElementById("topic-skill-analyzer");
    if (!skillContainer) return;

    skillContainer.innerHTML = `
        <div class="glass-panel" style="padding: 1.5rem; margin-bottom: 2rem; border-radius: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div>
                    <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.25rem;"><i data-lucide="brain" style="color: var(--cyan);"></i> Topic Skill Growth & Weakness Analyzer</h3>
                    <p class="text-muted" style="font-size: 0.85rem;">Identified weak skill areas based on submission error patterns across all 7 platforms</p>
                </div>
                <span class="badge" style="background: rgba(245, 158, 11, 0.2); color: var(--warning); padding: 0.4rem 0.8rem; font-size: 0.8rem;">⚠️ Focus Topic: Dynamic Programming</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 0.4rem;">
                        <span>Dynamic Programming</span>
                        <span style="color: var(--error);">45% (Needs Practice)</span>
                    </div>
                    <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                        <div style="width: 45%; height: 100%; background: var(--error);"></div>
                    </div>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 0.4rem;">
                        <span>Graph Algorithms</span>
                        <span style="color: var(--warning);">65% (Intermediate)</span>
                    </div>
                    <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                        <div style="width: 65%; height: 100%; background: var(--warning);"></div>
                    </div>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 0.4rem;">
                        <span>Trees & BST</span>
                        <span style="color: var(--cyan);">78% (Proficient)</span>
                    </div>
                    <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                        <div style="width: 78%; height: 100%; background: var(--cyan);"></div>
                    </div>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 0.4rem;">
                        <span>Math & Logic</span>
                        <span style="color: var(--success);">88% (Advanced)</span>
                    </div>
                    <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                        <div style="width: 88%; height: 100%; background: var(--success);"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
