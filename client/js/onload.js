import setInteractivePath from "./interactivePath.js";
import { clearDirectoryContentElements, createDirectoryContentElement } from "./directoryContents.js";
import { createDefaultDirectoryElement, createFolderStructureElement, clearFolderStructureElements } from "./folderStructure.js";
import getFolderElementByPath from "./getFolderElementByPath.js";

window.onload = () => {
	let pathname = window.location.pathname;

	const socket = io();
	window.socket = socket;

	socket.emit("is-path-valid", pathname, valid => {
		if (valid) {
			console.log("path is valid");
			setInteractivePath(pathname);
		} else {
			console.log("path is not valid");
		}
	});

	socket.emit("send-directory-contents", pathname);
	socket.emit("send-directory-folder-structure-recursive", pathname);

	socket.on("receive-directory-contents", data => {
		clearDirectoryContentElements();
		if (data.length === 0) {
			document.querySelector("#directory-contents").classList.add("empty");
		} else {
			document.querySelector("#directory-contents").classList.remove("empty");
		}
		for (let file of data) {
			createDirectoryContentElement(file.name, file.size, file.path.replaceAll(/\\/gi, "/"), file.isDirectory);
		}
	});

	socket.on("receive-directory-folder-structure-recursive", data => {
		clearFolderStructureElements();

		for (let i = 0; i < data.folderObjects.length; i++) {
			let object = data.folderObjects[i];
			if (object.path === "/") {
				createDefaultDirectoryElement();
			}

			let folder = getFolderElementByPath(object.path);
			folder.classList.add("open");

			for (let elem of object.contents) {
				createFolderStructureElement(folder, elem.name, elem.path, elem.hasSubDirectories);
			}
		}
	});
};

window.onpopstate = () => {
	socket.emit("send-directory-contents", window.location.pathname);
	socket.emit("send-directory-folder-structure-recursive", window.location.pathname);
};
