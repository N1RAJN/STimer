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
const sessionFilterDropdown = document.getElementById("sessionListFilter");
const sessionSortDropdown = document.getElementById("sessionListSort");
const addSessionTagInput = document.getElementById("addSessionTagInput");
const addSessionTagButton = document.getElementById("addSessionTagButton");
const sessionDate = document.getElementById("sessionDate");
export const sessionTitle = document.getElementById("sessionTitle");
export const sessionDescription = document.getElementById("sessionDescription");
export const sessionResources = document.getElementById("sessionResources");

const currDate = new Date();
const sessionTimeFilter = {
    Day: new Date(
        currDate.getFullYear(),
        currDate.getMonth(),
        currDate.getDate(),
    ).getTime(),
    Week: new Date(
        currDate.getFullYear(),
        currDate.getMonth(),
        currDate.getDate() - currDate.getDay(),
    ).getTime(),
    Month: new Date(currDate.getFullYear(), currDate.getMonth(), 1).getTime(),
    Year: new Date(currDate.getFullYear(), 0, 1).getTime(),
    All: 0,
};

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
var currentFilter = sessionTimeFilter.Day;
var sessionsToPopulate;
var allSessions;
var sessionTimerId;
var localSessionId;
var timerStarted = false;
var timerPaused = true;
var isSessionListHidden = true;

export var sessionDuration = { minutes: 0, seconds: 0 };
export var pauseStartedDate;
export var sessionStartedDate;
export var pauseEndedDate;
export var sessionEndedDate;
export var sessionInfo = {
    StartedAt: 0,
    EndedAt: 0,
    Duration: "",
    PausesInSession: [
        /*
        {
            startedAt: "",
            endedAt: "",
        },*/
    ],
    Title: "", // General indication of what I did (eg, neetcode )
    Description: "", // What I did specifically (eg backtracking, problem name)
    Tags: [], // What kind of work did I spend my time on (eg DSA)
    Resources: "", // Resources that I used (eg link of the problem i solved, solutions i may have used)
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
    filterSessionList();
    sortSessionList();
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
    sessionList.innerHTML = "";
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

function filterSessionList() {
    sessionsToPopulate = Object.entries(allSessions).filter(
        ([_, sessionObj]) => sessionObj.StartedAt >= currentFilter,
    );
}

function sortSessionList() {
    sessionsToPopulate.sort(currentSort);
}

const storeSessionLocal = () => {
    localSessionId = setInterval(() => {
        let sessionCopy = JSON.parse(JSON.stringify(sessionInfo));
        sessionCopy.StartedAt = +sessionStartedDate.getTime();
        sessionCopy.Duration =
            sessionDuration.minutes * 60 + sessionDuration.seconds;
        sessionCopy.EndedAt = +new Date().getTime();
        let pauses = sessionCopy.PausesInSession;
        if (timerPaused) {
            if (pauses.length == 0) {
                pauses.push({
                    StartedAt: pauseStartedDate.getTime(),
                    EndedAt: +new Date().getTime(),
                });
            } else {
                pauses[pauses.length - 1] = {
                    StartedAt: pauseStartedDate.getTime(),
                    EndedAt: +new Date().getTime(),
                };
            }
            sessionCopy.PausesInSession = pauses;
        }
        localStorage.setItem("activeSession", JSON.stringify(sessionCopy));
    }, 3000);
};
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
    sessionListContainer.style.display = "none";
    isSessionListHidden = true;
    timerContainer.style.marginTop = timerStarted ? "10rem" : "6rem";
    timerContainer.style.scale = timerStarted ? 1.6 : 1;
};

const startSessionTimer = () => {
    sessionStartedDate = new Date();
    timerStarted = true;
    timerPaused = false;
    storeSessionLocal();
    toggleFullScreenTimer();
    toggleTimerStopButton();
    sessionTimer();
};

const toggleSessionTimer = () => {
    if (!timerPaused) {
        timerPaused = true;
        clearInterval(sessionTimerId);
        pauseStartedDate = new Date();
    } else {
        timerPaused = false;
        pauseEndedDate = new Date();
        savePauseInfo();
        sessionTimer();
    }
};

const resetDisplayedTimer = () => {
    clearTimeout(sessionTimerId);
    clearTimeout(localSessionId);
    timerStarted = false;
    timerPaused = true;
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
        StartedAt: 0,
        EndedAt: 0,
        PausesInSession: [],
        Title: "",
        Description: "",
        Tags: [],
        Resources: "",
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
    if (timerPaused) {
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
        resetSessionTimer();
        //localStorage.removeItem("activeSession");
        const response = await result.text();
        const message = response.split("#");
        console.log(message[0]);
        allSessions[message[1]] = JSON.parse(JSON.stringify(sessionInfo));
        filterSessionList();
        sortSessionList();
        populateSessionList();
        resetSessionInfoInputs();
    } catch (err) {
        console.log(err);
    }
});

toggleSessionListButton.addEventListener("click", () => {
    if (timerStarted) return;
    sessionListContainer.style.display = isSessionListHidden ? "flex" : "none";
    isSessionListHidden = !isSessionListHidden;
    timerContainer.style.marginTop = isSessionListHidden ? "6rem" : "1rem";
    timerContainer.style.marginBottom = isSessionListHidden ? "6rem" : "1rem";
});

sessionFilterDropdown.addEventListener("change", () => {
    currentFilter = sessionTimeFilter[sessionFilterDropdown.value];
    filterSessionList();
    sortSessionList();
    populateSessionList();
});

sessionSortDropdown.addEventListener("change", () => {
    const sort = sessionSortDropdown.value.split(".");
    currentSort = sessionSorts[sort[0]][sort[1]];
    sortSessionList();
    populateSessionList();
});
