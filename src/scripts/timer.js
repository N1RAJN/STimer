const timerContainer = document.getElementById("timerContainer");
const timerControlButton = document.getElementById("controlButton");
const timerButtonState = document.getElementById("buttonState");
const buttonSvgPath = document.getElementById("buttonSVGPath");
const timer = document.getElementById("timer");

const initialDelay = 0;
const counterDelay = 1000; // milliseconds
var timerStarted = false;
var sessionDuration = 0;
var pauseDuration = 0;
var counterPaused = true;
var timerId;

const SVGPaths = {
  Play: "M5.92 24.096q0 0.832 0.576 1.408t1.44 0.608h4.032q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-4.032q-0.832 0-1.44 0.576t-0.576 1.44v16.16zM18.016 24.096q0 0.832 0.608 1.408t1.408 0.608h4.032q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-4.032q-0.832 0-1.408 0.576t-0.608 1.44v16.16z",
  Pause:
    "M5.92 24.096q0 1.088 0.928 1.728 0.512 0.288 1.088 0.288 0.448 0 0.896-0.224l16.16-8.064q0.48-0.256 0.8-0.736t0.288-1.088-0.288-1.056-0.8-0.736l-16.16-8.064q-0.448-0.224-0.896-0.224-0.544 0-1.088 0.288-0.928 0.608-0.928 1.728v16.16z",
};

const toggleControlButton = (e) => {
  e.preventDefault();
  const bState = timerButtonState.innerHTML;
  timerButtonState.innerHTML = bState == "Play" ? "Pause" : "Play";
  buttonSvgPath.setAttribute("d", SVGPaths[bState]);
};

const toggleTimer = () => {
  if (!counterPaused) {
    counterPaused = true;
    clearTimeout(timerId);
  } else {
    counterPaused = false;
    counter(initialDelay);
  }
};

const counter = (delay) => {
  if (!counterPaused) {
    timerId = setTimeout(() => {
      sessionDuration++;
      console.log(sessionDuration);
      counter(counterDelay);
    }, delay);
  }
};

const startTimer = () => {
  timerStarted = true;
  counterPaused = false;
  counter(initialDelay);
  // For no delay while starting/stopping timer
};

timerControlButton.addEventListener("click", (e) => {
  if (!timerStarted) {
    startTimer();
  } else {
    toggleTimer();
  }
  toggleControlButton(e);
});
