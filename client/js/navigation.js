import setInteractivePath from "./interactivePath.js";
import setDocumentTitle from "./setDocumentTitle.js";

document.querySelector("#backward-icon").addEventListener("click", backward);
document.querySelector("#forward-icon").addEventListener("click", forward);

export function load() {
	let path = window.location.pathname;
	setInteractivePath(path);
	setDocumentTitle(path);
	socket.emit("send-directory-contents", path);
	socket.emit("send-directory-folder-structure-recursive", path);
}

export function forward() {
	load();
	window.history.forward();
}

export function backward() {
	window.history.back();
	load();
}
