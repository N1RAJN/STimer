import { saveSessionInfo, savePauseInfo } from "./sessions.js";
import { SVGPaths } from "./svgs.js";

const timerContainer = document.getElementById("timerContainer");
const timerToggleButton = document.getElementById("timerToggleButton");
const timerStopButton = document.getElementById("timerStopButton");
const addResourceButton = document.getElementById("addResourceButton");
const timerButtonState = document.getElementById("buttonState");
const buttonSvgPath = document.getElementById("buttonSVGPath");
const timerMinutes = document.getElementById("timerMinutes");
const timerSeconds = document.getElementById("timerSeconds");
const sessionInfoDialogHeader = document.getElementById("dialogHeader");
const sessionInfoDialog = document.getElementById("sessionInfoDialog");
const sessionTagsList = document.getElementById("sessionTagsList");
const sessionInfoSaveButton = document.getElementById("sessionInfoSaveButton");
const sessionInfoDialogCloseButton = document.getElementById(
    "sessionInfoDialogCloseButton",
);
const toggleSessionListButton = document.getElementById(
    "toggleSessionListButton",
);
const sessionListContainer = document.getElementById("sessionListContainer");
const sessionList = document.getElementById("sessionList");
const addSessionTagInput = document.getElementById("addSessionTagInput");
const addSessionTagButton = document.getElementById("addSessionTagButton");
const sessionDate = document.getElementById("sessionDate");
export const sessionTitle = document.getElementById("sessionTitle");
export const sessionDescription = document.getElementById("sessionDescription");
export const sessionResources = document.getElementById("sessionResources");

const currDate = new Date();
const sessionTimeFilter = {
    Day:
        new Date(
            currDate.getFullYear(),
            currDate.getMonth(),
            currDate.getDate(),
        ).getTime() / 1000,
    Week:
        new Date(
            currDate.getFullYear(),
            currDate.getMonth(),
            currDate.getDate() - currDate.getDay(),
        ).getTime() / 1000,
    Month:
        new Date(currDate.getFullYear(), currDate.getMonth(), 1).getTime() /
        1000,
    Year: new Date(currDate.getFullYear(), 0, 1).getTime() / 1000,
    All: 0,
};

console.log(sessionTimeFilter);
const sessionSorts = {
    Duration: {
        ascending: (a, b) => a[1].Duration - b[1].Duration,
        descending: (a, b) => b[1].Duration - a[1].Duration,
    },
    Recency: {
        ascending: (a, b) => b[1].StartedAt - a[1].StartedAt, // More recent timestamps have higher UNIX time
        descending: (a, b) => a[1].StartedAt - b[1].StartedAt,
    },
};

const counterDelayMS = 1000;
var currentSort = sessionSorts.Recency.ascending;
var currentFilter = sessionTimeFilter.Week;
var sessionsToPopulate;
var allSessions;
var sessionTimerId;
var timerStarted = false;
var counterPaused = true;
var isSessionListHidden = true;

export var sessionDuration = { minutes: 0, seconds: 0 };
export var pauseStartedDate;
export var sessionStartedDate;
export var pauseEndedDate;
export var sessionEndedDate;
export var sessionInfo = {
    startedAt: "",
    endedAt: "",
    duration: "",
    pausesInSession: [
        /*
        {
            startedAt: "",
            endedAt: "",
        },*/
    ],
    title: "", // General indication of what I did (eg, neetcode )
    description: "", // What I did specifically (eg backtracking, problem name)
    tags: [], // What kind of work did I spend my time on (eg DSA)
    resources: "", // Resources that I used (eg link of the problem i solved, solutions i may have used)
};

(async () => {
    const sessions = await fetch("/api/getSession", {
        method: "POST",
        body: JSON.stringify({
            sort: "Today",
            timeRange: 40000,
        }),
    });
    allSessions = await sessions.json();
    filterSessionList(currentFilter);
    sortSessionList(currentSort);
    populateSessionList();
    const result = await fetch("/api/getTags");
    if (!result.ok) {
        console.error("Fetching the tags failed.");
        return;
    }
    const tags = await result.json();
    tags.forEach((tag) => {
        const tagDiv = document.createElement("div");
        tagDiv.innerHTML = tag;
        tagDiv.className = "Session-Tag-Card";
        sessionTagsList.appendChild(tagDiv);
    });
})();

function populateSessionList() {
    sessionsToPopulate.forEach(([sessionId, sessionInfo]) => {
        const sessionInfoCard = document.createElement("div");
        sessionInfoCard.classList.add("Session-Info-Card");
        sessionInfoCard.id = sessionId;

        const sessionInfoCardTitle = document.createElement("div");
        sessionInfoCardTitle.classList.add("Session-Info-Card-Title");
        sessionInfoCardTitle.innerHTML = sessionInfo.Title
            ? sessionInfo.Title
            : "—";

        const sessionInfoCardTimestamp = document.createElement("div");
        sessionInfoCardTimestamp.classList.add("Session-Info-Card-Timestamp");

        const sessionDate = new Date(sessionInfo.StartedAt * 1000);

        if (currentFilter != sessionTimeFilter.Day) {
            const timestampDate = document.createElement("span");
            timestampDate.classList.add("Timestamp-Date");
            timestampDate.innerHTML = sessionDate.toLocaleString(
                "en-US",
                formatSessionOptions(),
            );
            sessionInfoCardTimestamp.appendChild(timestampDate);
        }

        const timestampTime = document.createElement("span");
        timestampTime.classList.add("Timestamp-Time");
        timestampTime.innerHTML = sessionDate.toLocaleString("en-US", {
            hour: "numeric",
            hour12: true,
            minute: "numeric",
        });

        const timestampDuration = document.createElement("span");
        timestampDuration.classList.add("Timestamp-Duration");
        timestampDuration.innerHTML = `${(sessionInfo.Duration / 60).toFixed(0)} mins`;

        sessionInfoCardTimestamp.appendChild(timestampTime);
        sessionInfoCardTimestamp.appendChild(timestampDuration);

        sessionInfoCard.appendChild(sessionInfoCardTitle);
        sessionInfoCard.appendChild(sessionInfoCardTimestamp);

        sessionList.appendChild(sessionInfoCard);
    });
}

function formatSessionOptions() {
    let formatOptions = {};
    if (
        currentFilter <= sessionTimeFilter.Week ||
        currentFilter == sessionTimeFilter.Month
    ) {
        formatOptions.weekday = "short";
        formatOptions.day = "numeric";
    }
    if (currentFilter <= sessionTimeFilter.Year) {
        formatOptions.month = "short";
    }
    if (currentFilter <= sessionTimeFilter.All) {
        formatOptions.year = "numeric";
    }
    return formatOptions;
}

function filterSessionList(filterRange = currentFilter) {
    sessionsToPopulate = Object.entries(allSessions).filter(
        ([_, sessionObj]) => sessionObj.StartedAt >= filterRange,
    );
}

function sortSessionList(sortBy = currentSort) {
    sessionsToPopulate.sort(sortBy);
}

const sessionTimer = () => {
    sessionTimerId = setInterval(() => {
        sessionDuration.seconds = (sessionDuration.seconds + 1) % 60;
        if (sessionDuration.seconds === 0) {
            sessionDuration.minutes = sessionDuration.minutes + 1;
            let displayedMinute = sessionDuration.minutes
                .toString()
                .padStart(2, "0");
            timerMinutes.innerHTML = displayedMinute;
        }
        let displayedSecond = sessionDuration.seconds
            .toString()
            .padStart(2, "0");
        timerSeconds.innerHTML = displayedSecond;
    }, counterDelayMS);
};
const toggleTimerControlButton = () => {
    const buttonState = timerButtonState.innerHTML;
    timerButtonState.innerHTML = buttonState == "Play" ? "Pause" : "Play";
    buttonSvgPath.setAttribute("d", SVGPaths[timerButtonState.innerHTML]);
};

const toggleTimerStopButton = () => {
    timerStopButton.style.display = timerStarted ? "flex" : "none";
    addResourceButton.style.display = timerStarted ? "flex" : "none";
};

const toggleFullScreenTimer = () => {
    timerContainer.classList.add("is-Animating");
    timerStopButton.classList.add("is-Animating");
    setTimeout(() => {
        timerContainer.classList.remove("is-Animating");
        timerStopButton.classList.remove("is-Animating");
    }, 1000);
    timerContainer.style.marginTop = timerStarted ? "8rem" : "4rem";
    timerContainer.style.scale = timerStarted ? 1.6 : 1;
};

const startSessionTimer = () => {
    sessionStartedDate = new Date();
    timerStarted = true;
    counterPaused = false;
    toggleFullScreenTimer();
    toggleTimerStopButton();
    sessionTimer();
};

const toggleSessionTimer = () => {
    if (!counterPaused) {
        counterPaused = true;
        clearInterval(sessionTimerId);
        pauseStartedDate = new Date();
    } else {
        pauseEndedDate = new Date();
        savePauseInfo();
        counterPaused = false;
        sessionTimer();
    }
};

const resetDisplayedTimer = () => {
    clearTimeout(sessionTimerId);
    timerStarted = false;
    counterPaused = true;
    timerMinutes.innerHTML = "00";
    timerSeconds.innerHTML = "00";
    timerButtonState.innerHTML = "Play";
    buttonSvgPath.setAttribute("d", SVGPaths["Play"]);
    toggleFullScreenTimer();
    toggleTimerStopButton();
};

const resetSessionTimer = () => {
    sessionDuration.minutes = 0;
    sessionDuration.seconds = 0;
    sessionInfo = {
        startedAt: "",
        endedAt: "",
        pausesInSession: [],
        title: "",
        description: "",
        tags: [],
        resources: "",
    };
};

const resetSessionInfoInputs = () => {
    [sessionDate, sessionDescription, sessionTitle, sessionResources].forEach(
        (input) => {
            input.value = "";
        },
    );
    addSessionTagButton.innerHTML = "+";
    addSessionTagInput.style.visibility = "hidden";
};

const showSessionInfoDialog = () => {
    sessionDate.value = sessionStartedDate.toDateString();
    sessionInfoDialog.showModal();
};

sessionTagsList.addEventListener("click", (e) => {
    const classes = e.target.classList;
    if (classes.contains("Session-Tag-Card")) {
        if (classes.contains("Selected")) {
            e.target.classList.remove("Selected");
        } else {
            e.target.classList.add("Selected");
        }
    }
});

timerToggleButton.addEventListener("click", () => {
    if (!timerStarted) startSessionTimer();
    else toggleSessionTimer();
    toggleTimerControlButton();
});

timerStopButton.addEventListener("click", () => {
    sessionEndedDate = new Date();
    if (counterPaused) {
        pauseEndedDate = new Date();
        savePauseInfo();
    }
    resetDisplayedTimer();
    sessionInfoDialogHeader.innerHTML = "Session Completed!";
    sessionInfoSaveButton.innerText = "Save Session";
    showSessionInfoDialog();
});

addResourceButton.addEventListener("click", () => {
    sessionInfoDialogHeader.innerHTML = "Add Resources You Used.";
    sessionInfoSaveButton.innerText = "Add";
    showSessionInfoDialog();
});

sessionInfoDialogCloseButton.addEventListener("click", () => {
    sessionInfoDialog.close();
});

sessionInfoSaveButton.addEventListener("click", (e) => {
    e.preventDefault();
    sessionInfoDialog.close();
});

addSessionTagButton.addEventListener("click", () => {
    const buttonText = addSessionTagButton.innerHTML;
    if (buttonText == "+") {
        addSessionTagButton.innerHTML = "x";
        addSessionTagInput.style.visibility = "visible";
    } else {
        addSessionTagButton.innerHTML = "+";
        addSessionTagInput.style.visibility = "hidden";
        addSessionTagInput.value = "";
    }
});

addSessionTagInput.addEventListener("keypress", (e) => {
    if (e.key == "Enter") {
        const tagDiv = document.createElement("div");
        tagDiv.innerHTML = addSessionTagInput.value;
        tagDiv.className = "Session-Tag-Card";
        sessionTagsList.appendChild(tagDiv);
        addSessionTagButton.innerHTML = "+";
        addSessionTagInput.style.visibility = "hidden";
        addSessionTagInput.value = "";
    }
});

sessionInfoDialog.addEventListener("close", async () => {
    if (timerStarted) return;
    try {
        const result = await saveSessionInfo();
        if (!result.ok) {
            console.log("Some Error Occured!");
            return;
        }
        const message = await result.text();
        console.log(message);
        resetSessionInfoInputs();
    } catch (err) {
        console.log(err);
    }
    resetSessionTimer();
});

toggleSessionListButton.addEventListener("click", () => {
    if (timerStarted) return;
    sessionListContainer.style.display = isSessionListHidden ? "flex" : "none";
    isSessionListHidden = !isSessionListHidden;
});
