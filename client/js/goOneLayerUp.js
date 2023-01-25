import { getCookie, setCookie } from "./cookies.js";
import setInteractivePath from "./interactivePath.js";

export default function goOneLayerUp() {
	let newPath = getCookie("path").replace(/[^\/]+\/$/im, "");

	setCookie("path", newPath);
	setInteractivePath(newPath);

	window.socket.emit("send-directory-contents", newPath);
}
