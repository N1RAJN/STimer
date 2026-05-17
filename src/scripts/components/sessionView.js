import {
    sessionViewModal,
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

    sessionViewTitle.value = session.Title;
    sessionViewDescription.value = session.Description;
    sessionViewTags.innerHTML = session.Tags?.join(" ");
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

    // FIXME: Use started and ended unix times to calculate the duration, instead of the recorded
    const totalDuration = (ended - started) / 1000;
    sessionViewTotalDuration.innerHTML = formatDurationSec(totalDuration);
    sessionViewDuration.innerHTML = formatDurationSec(session.Duration);
    sessionViewPauseDuration.innerHTML = formatDurationSec(
        totalDuration - session.Duration,
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
