export const SVGPaths = {
    Pause: "M5.92 24.096q0 0.832 0.576 1.408t1.44 0.608h4.032q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-4.032q-0.832 0-1.44 0.576t-0.576 1.44v16.16zM18.016 24.096q0 0.832 0.608 1.408t1.408 0.608h4.032q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-4.032q-0.832 0-1.408 0.576t-0.608 1.44v16.16z",
    Play: "M5.92 24.096q0 1.088 0.928 1.728 0.512 0.288 1.088 0.288 0.448 0 0.896-0.224l16.16-8.064q0.48-0.256 0.8-0.736t0.288-1.088-0.288-1.056-0.8-0.736l-16.16-8.064q-0.448-0.224-0.896-0.224-0.544 0-1.088 0.288-0.928 0.608-0.928 1.728v16.16z",
    Stop: "M5.92 24.096q0 0.832 0.576 1.408t1.44 0.608h16.128q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-16.128q-0.832 0-1.44 0.576t-0.576 1.44v16.16z",
};
export const currDate = new Date();
export const sessionTimeFilter = {
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

export const sessionSorts = {
    Duration: {
        ascending: (a, b) => a[1].Duration - b[1].Duration,
        descending: (a, b) => b[1].Duration - a[1].Duration,
    },
    Recency: {
        ascending: (a, b) => b[1].StartedAt - a[1].StartedAt, // More recent timestamps have higher UNIX time
        descending: (a, b) => a[1].StartedAt - b[1].StartedAt,
    },
};
export const counterDelayMS = 1000;
export const saveIntervalMs = 300000;
export const customEvents = {
    TimerStopped: "timerStopped",
    SessionView: "sessionView",
};
export const MAX_ALPHA = 1.0;
export const MIN_ALPHA = 0.1;
export const THRESHOLD = 7200;
