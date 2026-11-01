/**
 * Profile Markdown Badge Exporter Component
 */
import { appState } from '../state.js';

export function setupExporterModal() {
    const exportBtn = document.getElementById("open-export-btn");
    const closeBtn = document.getElementById("close-export-btn");
    const copyBtn = document.getElementById("copy-badge-btn");
    const modal = document.getElementById("export-modal");
    const snippetEl = document.getElementById("markdown-badge-snippet");

    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            const handle = appState.handles.leetcode || appState.handles.codeforces || 'Developer';
            const solved = appState.totalSolved || 184;
            const snippet = `[![CodePulse Stats](https://img.shields.io/badge/CodePulse-${encodeURIComponent(handle)}%20%7C%20Total%20Solved%3A%20${solved}-8b5cf6?style=for-the-badge&logo=codeforces)](https://github.com/)`;

            if (snippetEl) snippetEl.textContent = snippet;
            if (modal) modal.classList.add("active");
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            if (modal) modal.classList.remove("active");
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            const text = snippetEl?.textContent || '';
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.innerHTML = `<i data-lucide="check"></i> Copied to Clipboard!`;
                if (typeof lucide !== 'undefined') lucide.createIcons();
                setTimeout(() => {
                    copyBtn.innerHTML = `<i data-lucide="copy"></i> Copy Markdown Badge`;
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }, 2000);
            });
        });
    }
}
