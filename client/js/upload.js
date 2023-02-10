export function registerDocumentUploadHandlers() {
	document.addEventListener("dragend", endDrag);
	document.addEventListener("dragleave", endDrag);
	document.addEventListener("drop", drop);
	document.addEventListener("dragstart", beginDrag);
	document.addEventListener("dragenter", beginDrag);
}

function beginDrag(e) {
	document.querySelector("#drop-overlay").classList.remove("hidden");
}

function endDrag(e) {
	document.querySelector("#drop-overlay").classList.add("hidden");
}

function drop(e) {
	endDrag();
}

function uploadFile(file) {}

function uploadFolder(folder) {}
