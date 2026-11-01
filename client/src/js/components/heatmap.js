/**
 * Redesigned Heatmap Component Renderer with Fixed Month Alignment
 */
import { appState } from '../state.js';

export function renderUnifiedHeatmap() {
    const grid = document.getElementById("heatmap-grid");
    const monthLabelsContainer = document.getElementById("month-labels");
    if (!grid || !monthLabelsContainer) return;

    grid.innerHTML = "";
    monthLabelsContainer.innerHTML = "";

    const now = new Date();
    const currentDay = now.getDay();
    const daysToMondayShift = currentDay === 0 ? 6 : currentDay - 1;
    const totalDaysToShow = 371; // 53 weeks * 7 days
    const startDate = new Date();
    startDate.setDate(now.getDate() - totalDaysToShow + daysToMondayShift + 1);

    const submissionCounts = {};
    appState.submissions.forEach(sub => {
        const d = new Date(sub.timestamp);
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        submissionCounts[dateKey] = (submissionCounts[dateKey] || 0) + 1;
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let lastMonth = -1;
    const monthLabels = Array(53).fill("");

    for (let dayIndex = 0; dayIndex < totalDaysToShow; dayIndex++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + dayIndex);

        const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        const count = submissionCounts[dateKey] || 0;

        const weekIndex = Math.floor(dayIndex / 7);
        if (currentDate.getDate() <= 7 && currentDate.getMonth() !== lastMonth) {
            monthLabels[weekIndex] = monthNames[currentDate.getMonth()];
            lastMonth = currentDate.getMonth();
        }

        const cell = document.createElement("div");
        cell.classList.add("heatmap-cell");
        
        let level = 0;
        if (count > 0 && count <= 2) level = 1;
        else if (count > 2 && count <= 4) level = 2;
        else if (count > 4 && count <= 6) level = 3;
        else if (count > 6) level = 4;

        cell.classList.add(`level-${level}`);
        const readableDate = currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        cell.setAttribute("data-tooltip", `${count} activities on ${readableDate}`);
        grid.appendChild(cell);
    }

    monthLabels.forEach((lbl, idx) => {
        const lblEl = document.createElement("span");
        lblEl.textContent = lbl;
        // Map exact grid column for month text
        lblEl.style.gridColumnStart = `${idx + 1}`;
        monthLabelsContainer.appendChild(lblEl);
    });
}
