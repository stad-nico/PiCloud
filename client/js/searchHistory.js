import { getCookie, setCookie } from "./cookies.js";
import updateInteractivePath from "./interactivePath.js";

let oneLayerUpButton = document.querySelector("#layer-up-icon");
oneLayerUpButton.addEventListener("click", () => goOneLayerUp());

function goOneLayerUp() {
	let newPath = getCookie("path").replace(/[^\/]+\/$/im, "");

	setCookie("path", newPath);
	updateInteractivePath();

	window.socket.emit("send-directory-contents", getCookie("path"));
}
