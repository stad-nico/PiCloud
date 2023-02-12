import setInteractivePath from "./interactivePath.js";
import { clearDirectoryContentElements, createDirectoryContentElement } from "./directoryContents.js";
import { createDefaultDirectoryElement, createFolderStructureElement, clearFolderStructureElements } from "./folderStructure.js";
import getFolderElementByPath from "./getFolderElementByPath.js";
import { load } from "./navigation.js";
import registerSocketEventHandlers from "./socketEventHandler.js";
import { createDropzoneForExternalOnly } from "./dropzone.js";

window.onload = () => {
	createDropzoneForExternalOnly(document.querySelector("#directory-contents"));

	let pathname = window.location.pathname;

	const socket = io();
	window.socket = socket;

	registerSocketEventHandlers(socket);

	socket.emit("is-path-valid", pathname, valid => {
		if (valid) {
			console.log("path is valid");
			load();
		} else {
			console.log("path is not valid");
		}
	});
};

window.onpopstate = () => {
	load();
};
