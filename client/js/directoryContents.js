import { setCookie, getCookie } from "./cookies.js";
import setInteractivePath from "./interactivePath.js";

export function clearDirectoryContentElements() {
	document.querySelector("#directory-contents").replaceChildren();
}

export function createDirectoryContentElement(filename, size, path, isDirectory = false) {
	let elem;

	if (isDirectory) {
		elem = createFolderElement(filename, path);
	} else {
		elem = createFileElement(filename, size, path);
	}

	document.querySelector("#directory-contents").appendChild(elem);
}

function createFolderElement(name, path) {
	let template = document.querySelector("#directory-content-folder-template");

	let folderElement = template.content.cloneNode(true).querySelector("div");
	folderElement.querySelector(".name").innerText = name;
	folderElement.querySelector(".path").innerText = path;

	folderElement.addEventListener("click", function () {
		if (!this.closest(".folder").classList.contains("active")) {
			document.querySelectorAll(".folder.active").forEach(elem => elem.classList.remove("active"));
			this.closest(".folder").classList.add("active");
			return;
		}

		let relPath = this.querySelector(".path").innerText;
		setCookie("path", relPath);
		setInteractivePath(getCookie("path"));
		window.socket.emit("send-directory-contents", getCookie("path"));
	});

	return folderElement;
}

function createFileElement(name, size, path) {
	let template = document.querySelector("#directory-content-file-template");

	let fileElement = template.content.cloneNode(true).querySelector("div");
	fileElement.querySelector(".name").innerText = getFileName(name);
	fileElement.querySelector(".extension").innerText = getFileExtension(name);
	fileElement.querySelector(".size").innerText = getFileSizeWithPrefix(size);
	fileElement.querySelector("a").setAttribute("href", "/download?path=" + encodeURIComponent(getCookie("path") + name));
	fileElement.querySelector("a").setAttribute("target", "_blank");
	fileElement.querySelector(".path").innerText = path;

	return fileElement;
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
