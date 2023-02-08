import { getCookie, setCookie } from "./cookies.js";
import setInteractivePath from "./interactivePath.js";
import { load } from "./navigation.js";

export function createFolderStructureElement(parentDirectoryElement, name, relPath, hasSubDirectories) {
	let template = document.querySelector("#folder-structure-folder-template");

	let folder = template.content.cloneNode(true).querySelector(".collapsable-folder-structure-element");
	folder.querySelector(".name").innerText = name;

	let path = relPath.endsWith("/") ? relPath : relPath + "/";
	folder.querySelector(".path").innerText = path;
	folder.classList.add("contents-not-loaded");

	folder.querySelector(".head").addEventListener("click", function () {
		openFolder(this.parentNode);
	});

	folder.querySelector(".open-in-new-tab-icon").setAttribute("href", path);

	if (hasSubDirectories) {
		folder.querySelector(".expand-icon").addEventListener("click", function (e) {
			e.stopPropagation();

			// toggleFolder(this.closest(".collapsable-folder-structure-element"));
		});
	} else {
		folder.classList.add("no-contents");
	}

	folder.addEventListener("contextmenu", function (e) {
		e.preventDefault();

		document.querySelector("#folder-structure-context-menu").removeAttribute("hidden");
		let contextMenus = document.querySelector("#context-menus");
		contextMenus.removeAttribute("hidden");
		contextMenus.style.top = e.clientY;
		contextMenus.style.left = e.clientX;

		document.addEventListener("mousedown", function (e) {
			document.querySelector("#folder-structure-context-menu").setAttribute("hidden", true);
			document.querySelector("#context-menus").setAttribute("hidden", true);
		});
	});

	parentDirectoryElement.querySelector(".content").appendChild(folder);

	return folder;
}

export function createDefaultDirectoryElement() {
	let template = document.querySelector("#folder-structure-folder-template");

	let folder = template.content.cloneNode(true);
	folder.querySelector(".name").innerText = "/";
	folder.querySelector(".path").innerText = "/";
	folder.querySelector(".collapsable-folder-structure-element").classList.add("open");

	folder.querySelector(".head").addEventListener("click", function () {
		if (!this.parentNode.classList.contains("open")) {
			openFolder(this.parentNode);
		}
	});

	let openInNew = folder.querySelector(".open-in-new-tab-icon");
	openInNew.setAttribute("href", "/");

	folder.querySelector(".expand-icon").addEventListener("click", function (e) {
		e.stopPropagation();

		toggleFolder(this.closest(".collapsable-folder-structure-element"));
	});

	document.querySelector("#folder-structure").appendChild(folder);
}

export function clearFolderStructureElements() {
	document.querySelector("#folder-structure").replaceChildren();
}

async function openFolder(folderElem) {
	folderElem.classList.add("open");
	let path = folderElem.querySelector(".path").innerText;
	window.history.pushState(path, "", path);
	load();
}
