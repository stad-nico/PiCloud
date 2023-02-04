import { getCookie, setCookie } from "./cookies.js";
import setInteractivePath from "./interactivePath.js";
// import { openLocation } from "./openLocation.js";

export function createFolderStructureElement(parentDirectoryElement, name, relPath, hasSubDirectories) {
	let template = document.querySelector("#folder-structure-folder-template");

	let folder = template.content.cloneNode(true).querySelector(".collapsable-folder-structure-element");
	folder.querySelector(".name").innerText = name;

	let path = relPath.endsWith("/") ? relPath : relPath + "/";
	folder.querySelector(".path").innerText = path;
	folder.classList.add("contents-not-loaded");

	folder.querySelector(".head").addEventListener("click", function () {
		if (!this.parentNode.classList.contains("open")) {
			expandFolder(this.parentNode);
		}
	});

	folder.querySelector(".open-in-new-tab-icon").setAttribute("href", path);

	if (hasSubDirectories) {
		folder.querySelector(".expand-icon").addEventListener("click", function (e) {
			e.stopPropagation();

			toggleFolder(this.closest(".collapsable-folder-structure-element"));
		});
	} else {
		folder.classList.add("no-contents");
	}

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
			expandFolder(this.parentNode);
		}
	});

	let openInNew = folder.querySelector(".open-in-new-tab-icon");
	openInNew.setAttribute("href", "/");
	openInNew.addEventListener("click", function (e) {
		e.preventDefault();
		window
			.open(
				"",
				"_blank"
				// "width= 640, height= 480, left=0, top=0, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no"
			)
			.blur();
		window.focus();
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
	}
}
