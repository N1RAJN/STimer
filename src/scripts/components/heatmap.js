import { heatmapCellContainer, heatmapDayLabel } from "../elements.js";
import { globals } from "../state.js";

export function initHeatmap() {
    const year = "2026";
    for (let i = 1; i <= 365; i++) {
        if ((i - 1) % 7 == 0) {
            var column = document.createElement("div");
            column.className = "Heatmap-Column";
        }
        const cell = document.createElement("div");
        cell.className = "Heatmap-Cell";
        const dateString = new Date(year, 0, i).toDateString();
        if (i <= 7) {
            const dayLabel = document.createElement("div");
            dayLabel.innerHTML = dateString.split(" ")[0];
            heatmapDayLabel.appendChild(dayLabel);
        }
        cell.id = dateString;
        const alpha =
            (globals.allSessionsByDate?.[dateString]?.[
                "totalSessionDuration"
            ] ?? 1) / 10;
        cell.style.backgroundColor = `rgba(255, 255, 255, ${alpha})`;

        column.appendChild(cell);
        heatmapCellContainer.appendChild(column);
    }
}
