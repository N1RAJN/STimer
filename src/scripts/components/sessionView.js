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
    sessionViewDescription,
} from "../elements.js";
import { globals } from "../state.js";
import { customEvents, formatDurationSec } from "../utils.js";
export function showSessionViewModal(sessionId) {
    const session = globals.allSessions[sessionId];
    sessionViewTitle.value = session.Title;
    sessionViewResources.value = session.Resources;
    sessionViewDescription.value = session.Description;
    sessionViewTags.innerHTML = session.Tags?.join(" ");
    sessionViewDate.innerHTML = new Date(session.StartedAt).toDateString();
    sessionViewStartedDate.innerHTML = new Date(
        session.StartedAt,
    ).toLocaleString("en-US", {
        hour: "numeric",
        hour12: true,
        minute: "numeric",
    });

    sessionViewEndedDate.innerHTML = new Date(session.EndedAt).toLocaleString(
        "en-US",
        {
            hour: "numeric",
            hour12: true,
            minute: "numeric",
        },
    );
    sessionViewDuration.innerHTML = formatDurationSec(session.Duration);
    sessionViewModal.showModal();
}

document.addEventListener(customEvents.SessionView, () => {
    showSessionViewModal(globals.sessionToView.id);
});
sessionViewModalCloseButton.addEventListener("click", () => {
    sessionViewModal.close();
});
