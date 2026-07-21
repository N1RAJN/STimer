import {
    sessionViewModal,
    sessionViewTimeStamp,
    sessionViewModalCloseButton,
    sessionViewTitle,
    sessionViewTags,
    sessionViewResources,
    sessionViewDate,
    sessionViewStartedDate,
    sessionViewEndedDate,
    sessionViewDuration,
    sessionViewTotalDuration,
    sessionViewPauseDuration,
    sessionViewDescription,
    sessionViewStartToolTip,
    sessionViewEndToolTip,
    sessionViewDurationToolTip,
} from "../elements.js";
import { globals } from "../state.js";
import {
    customEvents,
    formatDurationSec,
    getFormattedTimestamp,
} from "../utils.js";

export function showSessionViewModal(sessionId) {
    const session = globals.allSessions[sessionId];
    const started = session.StartedAt;
    const ended = session.EndedAt;

    sessionViewTimeStamp.innerHTML = "";
    sessionViewTitle.value = session.Title;
    sessionViewDescription.innerHTML = session.Description;
    sessionViewTags.innerHTML = session.Tags ? session.Tags.join(" ") : "";
    sessionViewDate.innerHTML = new Date(started).toDateString();
    sessionViewStartedDate.innerHTML = getFormattedTimestamp(started);

    sessionViewEndedDate.innerHTML = getFormattedTimestamp(ended);

    let totalPauseDuration = 0;
    let sectionStart = started;
    const makeSection = (className, startedAt, endedAt) => {
        const el = document.createElement("div");
        el.className = `Session-View-Timestamp-Section ${className}`;
        const duration = endedAt - startedAt;
        el.style.flex = duration / session.Duration;

        el.dataset.Started = getFormattedTimestamp(startedAt);
        el.dataset.Ended = getFormattedTimestamp(endedAt);
        el.dataset.Duration = formatDurationSec(duration / 1000);
        return el;
    };

    session.PausesInSession.forEach((pause) => {
        sessionViewTimeStamp.append(
            makeSection("Study", sectionStart, pause.StartedAt),
        );
        sessionViewTimeStamp.append(
            makeSection("Pause", pause.StartedAt, pause.EndedAt),
        );
        totalPauseDuration += pause.Duration;
        sectionStart = pause.EndedAt;
    });

    if (sectionStart < session.EndedAt) {
        sessionViewTimeStamp.append(
            makeSection("Study", sectionStart, session.EndedAt),
        );
    }
    sessionViewTotalDuration.innerHTML = formatDurationSec(session.Duration);
    sessionViewPauseDuration.innerHTML = formatDurationSec(totalPauseDuration);
    sessionViewDuration.innerHTML = formatDurationSec(
        session.Duration - totalPauseDuration,
    );

    let links = "";
    session.Resources.split("\n").forEach((link) => {
        const isLink = link.search("^https:/");
        links +=
            isLink === -1
                ? `${link}<br>`
                : `<a href=${link} target="_blank"> ${link}</a><br>`;
    });
    sessionViewResources.innerHTML = links;

    sessionViewTimeStamp.addEventListener("mouseover", (e) => {
        const section = e.target;
        const startedAt = section.dataset.Started;
        const endedAt = section.dataset.Ended;
        const duration = section.dataset.Duration;
        const rect = e.target.getBoundingClientRect();
        const width = rect.width;
        sessionViewStartToolTip.textContent = startedAt;
        sessionViewStartToolTip.style.left = `${rect.left}px`;
        sessionViewStartToolTip.style.top = `${rect.top - 30}px`;

        sessionViewEndToolTip.textContent = endedAt;
        sessionViewEndToolTip.style.left = `${rect.right}px`;
        sessionViewEndToolTip.style.top = `${rect.top - 30}px`;
        sessionViewEndToolTip.style.transform = `translateX(-100%)`;

        sessionViewDurationToolTip.textContent = duration;
        sessionViewDurationToolTip.style.left = `${rect.left + rect.width / 2}px`;
        sessionViewDurationToolTip.style.top = `${rect.top - 30}px`;
        sessionViewDurationToolTip.style.transform = `translateX(-50%)`;

        sessionViewDurationToolTip.style.display = "flex";

        if (width < 150) {
            sessionViewStartToolTip.style.display = "none";
            sessionViewEndToolTip.style.display = "none";
        } else {
            sessionViewStartToolTip.style.display = "flex";
            sessionViewEndToolTip.style.display = "flex";
        }
    });

    sessionViewTimeStamp.addEventListener("mouseout", () => {
        sessionViewStartToolTip.style.display = "none";
        sessionViewEndToolTip.style.display = "none";
        sessionViewDurationToolTip.style.display = "none";
        sessionViewStartToolTip.innerHTML = " ";
        sessionViewEndToolTip.innerHTML = " ";
        sessionViewDurationToolTip.innerHTML = " ";
    });
    sessionViewModal.showModal();
}

document.addEventListener(customEvents.SessionView, () => {
    showSessionViewModal(globals.sessionToView.id);
});
sessionViewModalCloseButton.addEventListener("click", () => {
    sessionViewModal.close();
});
