import { setCookie, getCookie } from "./cookies.js";
import updateInteractivePath from "./interactivePath.js";

export function clearDirectoryContentElements() {
	document.querySelector("#directory-contents").replaceChildren();
}

export function createDirectoryContentElement(filename, size, path, isDirectory = false) {
	if (isDirectory) {
		displayFolder(filename, path);
	} else {
		displayFile(filename, size, path);
	}
}

function displayFolder(name, path) {
	let template = document.querySelector("#directory-content-folder-template");

	let folder = template.content.cloneNode(true);
	folder.querySelector(".name").innerText = name;
	folder.querySelector(".path").innerText = path;

	let div = folder.querySelector("div");
	div.addEventListener("click", function () {
		let relPath = this.querySelector(".path").innerText;
		setCookie("path", relPath);
		updateInteractivePath();
		window.socket.emit("send-directory-contents", getCookie("path"));
	});

	let container = document.querySelector("#directory-contents");
	container.append(folder);
}

function displayFile(name, size, path) {
	let template = document.querySelector("#directory-content-file-template");

	let file = template.content.cloneNode(true);
	file.querySelector(".name").innerText = getFileName(name);
	file.querySelector(".extension").innerText = getFileExtension(name);
	file.querySelector(".size").innerText = getFileSizeWithPrefix(size);
	file.querySelector("a").setAttribute("href", "/download?path=" + encodeURIComponent(getCookie("path") + name));
	file.querySelector("a").setAttribute("target", "_blank");
	file.querySelector(".path").innerText = path;

	let container = document.querySelector("#directory-contents");
	container.append(file);
}

function getFileExtension(filename) {
	let match = filename.match(/\.([a-zA-Z])+$/m);

	if (match !== null && match[0]) {
		return match[0];
	}

	return "";
}

function getFileName(filename) {
	return filename.replace(getFileExtension(filename), "");
}

let sizePrefixes = ["", "K", "M", "G"];

function getFileSizeWithPrefix(size) {
	let length = size.toString().length;
	let short = size / Math.pow(10, 3 * Math.floor(length / 3));
	short = Math.ceil(short);

	let prefix = sizePrefixes[Math.floor(length / 3)];

	return short + " " + prefix + "B";
}
