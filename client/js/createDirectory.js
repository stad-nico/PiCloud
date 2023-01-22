import { getCookie } from "./cookies.js";

let createDirectoryButton = document.querySelector("#create-folder-icon");
createDirectoryButton.addEventListener("click", () => createDirectory());

export function createDirectory() {
	let folderElement = createEditableFolderElementWithFocus();
	let editableNameField = folderElement.querySelector(".name");

	editableNameField.addEventListener("keydown", nameFieldHandler);
	document.addEventListener("mousedown", documentHandler);
}

function nameFieldHandler(event) {
	handler(event, nameFieldCallback);
}

function documentHandler(event) {
	handler(event, documentCallback);
}

function handler(event, callback) {
	if (event instanceof KeyboardEvent) {
		if (event.keyCode !== 13) {
			return;
		} else {
			event.preventDefault();
		}
	}

	let folderElement = document.querySelector(".folder.editable");
	let editableNameField = folderElement.querySelector(".name");

	if (editableNameField.innerText === "") {
		removeEditableFolderElement();
		document.removeEventListener("mousedown", documentHandler);
	} else {
		window.socket.emit("create-directory", getCookie("path") + editableNameField.innerText, error =>
			callback(folderElement, editableNameField, error)
		);
	}
}

function documentCallback(folderElement, editableNameField, error) {
	if (error) {
		console.log(error);
		focus(editableNameField);
	} else {
		console.log("successfully created directory");
		makeEditableFolderElementPermanent(folderElement);
		document.removeEventListener("mousedown", documentHandler);
		editableNameField.removeEventListener("keydown", nameFieldHandler);
	}
}

function nameFieldCallback(folderElement, editableNameField, error) {
	if (error) {
		console.log(error);
	} else {
		console.log("successfully created directory");
		makeEditableFolderElementPermanent(folderElement);
		document.removeEventListener("mousedown", documentHandler);
		editableNameField.removeEventListener("keydown", nameFieldHandler);
	}
}

function makeEditableFolderElementPermanent(folderElement) {
	folderElement.classList.remove("editable");
	folderElement.querySelector(".name").removeAttribute("contenteditable");
}

function removeEditableFolderElement() {
	for (let elem of Array.from(document.querySelectorAll(".folder.editable"))) {
		elem.remove();
	}
}

function focus(element) {
	setTimeout(() => {
		element.focus();
	}, 0);
}

function createEditableFolderElementWithFocus() {
	let template = document.querySelector("#directory-content-folder-template");

	let folder = template.content.cloneNode(true);
	folder.querySelector(".folder").classList.add("editable");

	let nameElement = folder.querySelector(".name");
	nameElement.setAttribute("contenteditable", true);
	nameElement.setAttribute("spellcheck", false);
	focus(nameElement);

	let container = document.querySelector("#directory-contents");
	container.scrollTop = 0;
	container.insertBefore(folder, container.firstChild);

	return nameElement.parentNode;
}
