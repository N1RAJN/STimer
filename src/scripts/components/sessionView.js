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
} from "../elements.js";
import { globals } from "../state.js";
import { customEvents, formatDurationSec } from "../utils.js";
export function showSessionViewModal(sessionId) {
    const session = globals.allSessions[sessionId];
    const started = session.StartedAt;
    const ended = session.EndedAt;

    sessionViewTimeStamp.innerHTML = "";
    sessionViewTitle.value = session.Title;
    sessionViewDescription.innerHTML = session.Description;
    sessionViewTags.innerHTML = session.Tags ? session.Tags.join(" ") : "";
    sessionViewDate.innerHTML = new Date(started).toDateString();
    sessionViewStartedDate.innerHTML = new Date(started).toLocaleString(
        "en-US",
        {
            hour: "numeric",
            hour12: true,
            minute: "numeric",
        },
    );

    sessionViewEndedDate.innerHTML = new Date(ended).toLocaleString("en-US", {
        hour: "numeric",
        hour12: true,
        minute: "numeric",
    });

    let totalPauseDuration = 0;
    let sectionStart = session.StartedAt;
    const makeSection = (className, duration) => {
        const el = document.createElement("div");
        el.className = `Session-View-Timestamp-Section ${className}`;
        el.style.flex = duration / session.Duration;
        return el;
    };

    session.PausesInSession.forEach((pause) => {
        sessionViewTimeStamp.append(
            makeSection("Study", pause.StartedAt - sectionStart),
        );
        sessionViewTimeStamp.append(
            makeSection("Pause", pause.EndedAt - pause.StartedAt),
        );
        totalPauseDuration += pause.Duration;
        sectionStart = pause.EndedAt;
    });

    if (sectionStart < session.EndedAt) {
        sessionViewTimeStamp.append(
            makeSection("Study", session.EndedAt - sectionStart),
        );
    }
    sessionViewTotalDuration.innerHTML = formatDurationSec(session.Duration);
    sessionViewPauseDuration.innerHTML = formatDurationSec(totalPauseDuration);
    sessionViewDuration.innerHTML = formatDurationSec(
        session.Duration - totalPauseDuration,
    );

    let links = "";
    session.Resources.split("\n").forEach((link) => {
        links += `<a href=${link} target="_blank"> ${link}</a><br/>`;
    });
    sessionViewResources.innerHTML = links;
    sessionViewModal.showModal();
}

document.addEventListener(customEvents.SessionView, () => {
    showSessionViewModal(globals.sessionToView.id);
});
sessionViewModalCloseButton.addEventListener("click", () => {
    sessionViewModal.close();
});
