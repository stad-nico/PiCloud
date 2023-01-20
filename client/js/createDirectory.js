import { getCookie } from "./cookies.js";

let createDirectoryButton = document.querySelector("#create-folder-icon");
createDirectoryButton.addEventListener("click", () => createDirectory());

export function createDirectory() {
	let name = window.prompt("Enter the name of the new directory", getCookie("path"));

	if (name !== null) {
		window.socket.emit("create-directory", name);
	}
}
