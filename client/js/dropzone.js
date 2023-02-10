var source;

export function createDraggable(element) {
	element.setAttribute("draggable", true);

	element.addEventListener("dragstart", function (e) {
		// disallow dragging onto itself
		this.removeEventListener("dragover", block);
		this.classList.add("drag-hover");
		e.dataTransfer.setData("text/plain", this.querySelector(".path").innerText);
		source = this;
	});

	element.addEventListener("dragend", function (e) {
		element.addEventListener("dragover", block);
		source.classList.remove("drag-hover");
	});

	element.addEventListener("dragleave", function (e) {
		if (this !== source) {
			this.classList.remove("drag-hover");
		}
	});

	element.addEventListener("drop", function (e) {
		console.log(e.dataTransfer.getData("text/plain"));
		source.addEventListener("dragover", block);
		source.classList.remove("drag-hover");
		this.classList.remove("drag-hover");
	});
}

export function createDropzone(element) {
	element.addEventListener("dragover", block);
	element.addEventListener("dragenter", block);
}

function block(e) {
	e.preventDefault();
	this.classList.add("drag-hover");
}
