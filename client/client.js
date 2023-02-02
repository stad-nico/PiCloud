// import { io } from "https://cdnjs.cloudflare.com/ajax/libs/socket.io/3.0.0/socket.io.js";
// let io: any;

import { getCookie, setCookie } from "./js/cookies.js";
import { clearDirectoryContentElements, createDirectoryContentElement } from "./js/directoryContents.js";
import { clearFolderStructureElements, createDefaultDirectoryElement, createFolderStructureElement } from "./js/folderStructure.js";
import getFolderElementByPath from "./js/getFolderElementByPath.js";
import setInteractivePath from "./js/interactivePath.js";

const socket = io();

const timer = ms => new Promise(res => setTimeout(res, ms));

window.socket = socket;
console.log(socket);

socket.on("connect", () => {
	clearDirectoryContentElements();
	clearFolderStructureElements();
	socket.emit("send-directory-folder-structure", "/");

	if (!getCookie("path")) {
		setCookie("path", "/");
	}

	setInteractivePath(getCookie("path"));
	socket.emit("send-directory-contents", getCookie("path"));
});

socket.on("store-uuid", uuid => {
	setCookie("uuid", uuid);
});

socket.on("get-uuid", callback => {
	callback(getCookie("uuid"));
});

socket.on("receive-directory-contents", data => {
	(async () => {
		clearDirectoryContentElements();
		if (data.length === 0) {
			document.querySelector("#directory-contents").classList.add("empty");
		} else {
			document.querySelector("#directory-contents").classList.remove("empty");
		}
		for (let file of data) {
			createDirectoryContentElement(file.name, file.size, file.path.replaceAll(/\\/gi, "/"), file.isDirectory);
			// await timer(10);s
		}
	})();
});

socket.on("receive-directory-folder-structure", data => {
	(async () => {
		let { path, folderObjects } = data;

		if (path === "/") {
			createDefaultDirectoryElement();
		}

		let folder = getFolderElementByPath(path);
		folder.querySelector(".content").replaceChildren();

		folderObjects.forEach(object => {
			createFolderStructureElement(folder, object.name, path, object.hasSubDirectories);
		});
	})();
});

socket.on("receive-error", data => {
	console.log(data);
});

socket.on("reload", () => {
	console.log("reloading");
	socket.emit("send-directory-contents", getCookie("path"));
	socket.emit("send-directory-folder-structure", getCookie("path"));
});
