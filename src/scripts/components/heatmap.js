import {
    heatmapCellContainer,
    heatmapDayLabel,
    heatmapCellToolTip,
} from "../elements.js";
import { globals } from "../state.js";
import { currDate } from "../utils.js";

var toolId;

function populateHeatmapCell() {
    const year = "2026";
    for (let i = 1; i <= 365; i++) {
        if ((i - 1) % 7 == 0) {
            var column = document.createElement("div");
            column.className = "Heatmap-Column";
        }
        const cell = document.createElement("div");
        cell.className = "Heatmap-Cell";
        const dateString = new Date(year, 0, i).toDateString();
        // Day Labels
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

function populateToolTip(e) {
    if (e.target.className.split(" ")[0] != "Heatmap-Cell") {
        heatmapCellToolTip.innerHTML = " ";
        return;
    }
    toolId = setTimeout(() => {
        const cellDate = e.target.id;
        const duration =
            globals.allSessionsByDate?.[cellDate]?.["totalSessionDuration"] ??
            0;

        let formattedDate = cellDate.replace(
            /(\w+) (\w+) (\d+) (\d+)/,
            "$1, $2 $3, $4",
        );
        let hour = Math.floor(duration / 3600);
        let min = Math.floor(duration / 60) % 60;
        let sec = duration % 60;
        let formattedDuration = [
            hour && `${hour}h`,
            min && `${min}m`,
            `${sec}s`,
        ]
            .filter(Boolean)
            .join(" ");

        heatmapCellToolTip.innerHTML = `${formattedDate} : ${formattedDuration}`;
        heatmapCellToolTip.style.left = `${e.clientX + 12}px`;
        heatmapCellToolTip.style.top = `${e.clientY + 12}px`;
        heatmapCellToolTip.style.display = "flex";
    }, 600);
}

export function initHeatmap() {
    populateHeatmapCell();
    document
        .getElementById(`${currDate.toDateString()}`)
        .classList.add("Today");
    heatmapCellContainer.addEventListener("mouseover", (e) =>
        populateToolTip(e),
    );
    heatmapCellContainer.addEventListener("mouseout", () => {
        clearTimeout(toolId);
        heatmapCellToolTip.style.display = "none";
        heatmapCellToolTip.innerHTML = " ";
    });
}
