import { heatMapContainer } from "../elements.js";
import { globals } from "../state.js";
import { currDate } from "../utils.js";

export function initHeatmap() {
    for (let i = 1; i <= 365; i += 7) {
        const column = document.createElement("div");
        column.className = "Heatmap-Column";
        for (let j = 1; j <= 7; ++j) {
            const cell = document.createElement("div");
            cell.className = "Heatmap-Cell";
            column.appendChild(cell);
        }
        heatMapContainer.appendChild(column);
    }
}
