import setInteractivePath from "./interactivePath.js";
import setDocumentTitle from "./setDocumentTitle.js";

document.querySelector("#backward-icon").addEventListener("click", backward);
document.querySelector("#forward-icon").addEventListener("click", forward);
document.querySelector("#layer-up-icon").addEventListener("click", up);

export function load() {
	let path = window.location.pathname;
	setInteractivePath(path);
	setDocumentTitle(path);
	socket.emit("send-directory-contents", path);
	socket.emit("send-directory-folder-structure-recursive", path);

	if (path === "/" || path === "") {
		document.querySelector("#backward-icon").classList.add("disabled");
	} else {
		document.querySelector("#backward-icon").classList.remove("disabled");
	}
}

export function forward() {
	window.history.forward();
	load();
}

export function backward() {
	if (window.history.state !== null) {
		// only go back if you wouldnt leave the webserver
		window.history.back();
		load();
	}
}

export function up() {
	let newPath = window.location.pathname.replace(/[^\/]+\/$/im, "");
	window.history.replaceState(newPath, "", newPath);
	load();
}
