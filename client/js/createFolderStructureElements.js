export function createFolderStructureElement(parentDirectoryElement, name, relPath) {
	let template = document.querySelector("#folder-structure-folder-template");

	let folder = template.content.cloneNode(true);
	folder.querySelector(".name").innerText = name;

	let path = relPath.endsWith("/") ? relPath + name + "/" : relPath + "/" + name + "/";
	folder.querySelector(".path").innerText = path;
	folder.querySelector(".collapsable-folder-structure-element").classList.add("contents-not-loaded");

	folder.querySelector(".head").addEventListener("click", function () {
		if (this.parentNode.classList.contains("contents-not-loaded")) {
			this.parentNode.classList.remove("contents-not-loaded");
			window.socket.emit("send-directory-folder-structure", this.querySelector(".path").innerText);
		}
		this.parentNode.classList.toggle("open");
	});

	parentDirectoryElement.querySelector(".content").appendChild(folder);
}

export function createDefaultDirectoryElement() {
	let template = document.querySelector("#folder-structure-folder-template");

	let folder = template.content.cloneNode(true);
	folder.querySelector(".name").innerText = "/";
	folder.querySelector(".path").innerText = "/";
	folder.querySelector(".collapsable-folder-structure-element").classList.add("open");
	folder.querySelector(".head").addEventListener("click", function () {
		this.parentNode.classList.toggle("open");
	});

	document.querySelector("#folder-structure").appendChild(folder);
}
