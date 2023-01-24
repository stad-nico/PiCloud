import { getCookie, setCookie } from "./cookies.js";
import updateInteractivePath from "./interactivePath.js";

export function createFolderStructureElement(parentDirectoryElement, name, relPath, hasSubDirectories) {
	let template = document.querySelector("#folder-structure-folder-template");

	let folder = template.content.cloneNode(true);
	folder.querySelector(".name").innerText = name;

	let path = relPath.endsWith("/") ? relPath + name + "/" : relPath + "/" + name + "/";
	folder.querySelector(".path").innerText = path;
	folder.querySelector(".collapsable-folder-structure-element").classList.add("contents-not-loaded");

	folder.querySelector(".head").addEventListener("click", function () {
		if (!this.parentNode.classList.contains("open")) {
			expandFolder(this.parentNode);
		}

		openFolder(this);
		setCookie("path", this.parentNode.querySelector(".path").innerText);
		setInteractivePath(getCookie("path"));
	});

	if (hasSubDirectories) {
		folder.querySelector(".expand-icon").addEventListener("click", function (e) {
			e.stopPropagation();

			toggleFolder(this.closest(".collapsable-folder-structure-element"));
		});
	} else {
		folder.querySelector(".expand-icon").classList.add("hidden");
	}

	parentDirectoryElement.querySelector(".content").appendChild(folder);
}

export function createDefaultDirectoryElement() {
	let template = document.querySelector("#folder-structure-folder-template");

	let folder = template.content.cloneNode(true);
	folder.querySelector(".name").innerText = "/";
	folder.querySelector(".path").innerText = "/";
	folder.querySelector(".collapsable-folder-structure-element").classList.add("open");

	folder.querySelector(".head").addEventListener("click", function () {
		if (!this.parentNode.classList.contains("open")) {
			expandFolder(this.parentNode);
		}

		openFolder(this);
		setCookie("path", "/");
		setInteractivePath(getCookie("path"));
	});

	folder.querySelector(".expand-icon").addEventListener("click", function (e) {
		e.stopPropagation();

		toggleFolder(this.closest(".collapsable-folder-structure-element"));
	});

	document.querySelector("#folder-structure").appendChild(folder);
}

export function clearFolderStructureElements() {
	document.querySelector("#folder-structure").replaceChildren();
}

function toggleFolder(folderElem) {
	if (folderElem.classList.contains("open")) {
		folderElem.classList.remove("open");
	} else {
		expandFolder(folderElem);
	}
}

async function expandFolder(folderElem) {
	folderElem.classList.add("open");

	if (folderElem.classList.contains("contents-not-loaded")) {
		folderElem.classList.remove("contents-not-loaded");
		window.socket.emit("send-directory-folder-structure", folderElem.querySelector(".path").innerText);
	}
}

function openFolder(folderElement) {
	window.socket.emit("send-directory-contents", folderElement.querySelector(".path").innerText);
}
