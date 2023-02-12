import { clearDirectoryContentElements, createDirectoryContentElement } from "./directoryContents.js";
import { createFolderStructureElement, createDefaultDirectoryElement, clearFolderStructureElements } from "./folderStructure.js";
import getFolderElementByPath from "./getFolderElementByPath.js";

export default function registerSocketEventHandlers(socket) {
	socket.on("receive-directory-contents", data => {
		clearDirectoryContentElements();
		if (data.length === 0) {
			document.querySelector("#directory-contents #contents").classList.add("empty");
		} else {
			document.querySelector("#directory-contents #contents").classList.remove("empty");
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

	socket.on("reload", () => {
		socket.emit("send-directory-contents", window.location.pathname);
		socket.emit("send-directory-folder-structure-recursive", window.location.pathname);
	});
}
