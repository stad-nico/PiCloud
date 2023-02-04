import { setCookie, getCookie } from "./cookies.js";
import setInteractivePath from "./interactivePath.js";
import { load } from "./navigation.js";

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
		} else {
			window.history.pushState(path, "", path);
			load();
		}
	});

	folderElement.addEventListener("dragenter", event => {
		event.preventDefault();
	});

	folderElement.addEventListener("dragover", event => {
		event.preventDefault();
	});

	folderElement.addEventListener("drop", function (event) {
		let oldPath = event.dataTransfer.getData("text/plain");

		if (oldPath === this.querySelector(".path").innerText) {
			return; // prevent moving on itself
		}

		let o = oldPath.match(/[^\/]+\/$/gim)[0];
		let newPath = this.querySelector(".path").innerText + o;

		window.socket.emit("rename-directory", oldPath, newPath, error => {
			if (error) {
				console.log(error);
			} else {
				console.log("successfully moved directory");
			}
		});
	});

	folderElement.addEventListener("dragstart", event => {
		event.dataTransfer.setData("text/plain", event.target.querySelector(".path").innerText);
	});

	folderElement.querySelector("div.delete-icon").addEventListener("click", function (event) {
		event.stopPropagation();

		let d = window.confirm("Delete?");

		if (!d) {
			return;
		}

		window.socket.emit("delete-directory", this.closest(".folder").querySelector(".path").innerText, error => {
			if (error) {
				console.log(error);
			} else {
				console.log("successfully removed dir");
			}
		});
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
