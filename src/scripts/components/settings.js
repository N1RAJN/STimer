import {
    settingsButton,
    settingsModal,
    settingsModalCloseButton,
} from "../elements.js";
export function initSettings() {
    settingsButton.addEventListener("click", () => {
        settingsModal.showModal();
    });

    settingsModalCloseButton.addEventListener("click", () => {
        settingsModal.close();
    });
}
