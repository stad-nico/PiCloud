// import { io } from "https://cdnjs.cloudflare.com/ajax/libs/socket.io/3.0.0/socket.io.js";
// let io: any;

import { getCookie, setCookie } from "./js/cookies.js";
import { clearDirectoryContentElements, createDirectoryContentElement } from "./js/createDirectoryContentElements.js";
import { createDefaultDirectoryElement, createFolderStructureElement } from "./js/createFolderStructureElements.js";
import updateInteractivePath from "./js/interactivePath.js";
import getFolderElementByPath from "./js/getFolderElementByPath.js";

const socket = io();

const timer = ms => new Promise(res => setTimeout(res, ms));

window.socket = socket;
console.log(socket);

socket.on("connect", () => {
	socket.emit("send-directory-folder-structure", "/");

	let searchParams = new URLSearchParams(window.location.search);

	if (!getCookie("path")) {
		setCookie("path", "/");
	}

	updateInteractivePath();
	socket.emit("send-directory-contents", getCookie("path"));
});

socket.on("receive-directory-contents", data => {
	clearDirectoryContentElements();

	if (data.length === 0) {
		// directory is empty
		document.querySelector("#directory-contents").classList.add("empty");
	} else {
		document.querySelector("#directory-contents").classList.remove("empty");
	}

	(async () => {
		for (let file of data) {
			createDirectoryContentElement(file.name, file.size, file.path.replaceAll(/\\/gi, "/"), file.isDirectory);
			await timer(10);
		}
	})();
});

socket.on("receive-directory-folder-structure", data => {
	let { path, folderNames } = data;

	if (path === "/") {
		createDefaultDirectoryElement();
	}

	let folder = getFolderElementByPath(path);

	folderNames.forEach(name => {
		createFolderStructureElement(folder, name, path);
	});
});
