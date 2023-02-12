// block the "move/copy/etc allowed" visuals for external files
window.addEventListener(
	"dragover",
	function (e) {
		e = e || event;
		e.preventDefault();
		e.dataTransfer.dropEffect = "none";
		e.dataTransfer.effectAllowed = "none";
	},
	false
);

window.addEventListener("drop", function (e) {
	e.preventDefault();
	e.dataTransfer.effectAllowed = "none";
	e.dataTransfer.dropEffect = "none";
});

export function createDraggable(element) {
	element.setAttribute("draggable", true);

	element.addEventListener("dragover", block_2);

	element.addEventListener("dragstart", function (e) {
		this.classList.add("drag-hover");
		e.dataTransfer.setData(this.querySelector(".path").innerText, "");
		e.dataTransfer.setData(this.getAttribute("data-drag-class"), "");
		e.dataTransfer.effectAllowed = "all";
	});

	element.addEventListener("dragenter", function (e) {
		e.preventDefault();
		e.stopPropagation();
		this.classList.add("drag-hover");

		if (this.classList.contains("file")) {
			this.removeEventListener("dragover", block_2);
			this.closest("#directory-contents").removeEventListener("dragover", block);
		} else if (
			e.dataTransfer.types[0] === this.getAttribute("data-drag-class") &&
			e.dataTransfer.types[1] === this.querySelector(".path").innerText
		) {
			this.removeEventListener("dragover", block_2);
		} else {
			this.addEventListener("dragover", block_2);
		}
	});

	element.addEventListener("dragend", function (e) {
		this.classList.remove("drag-hover");
	});

	element.addEventListener("dragleave", function (e) {
		if (e.dataTransfer.types[0] !== this.getAttribute("data-drag-class") || e.dataTransfer.types[1] !== this.querySelector(".path").innerText) {
			this.classList.remove("drag-hover");
		}

		if (this.classList.contains("file")) {
			this.closest("#directory-contents").addEventListener("dragover", block);
		}
		e.stopPropagation();
	});

	element.addEventListener("drop", function (e) {
		// console.log(e.dataTransfer.getData("text/plain"));
		// source.addEventListener("dragover", block);
		// source.classList.remove("drag-hover");
		// this.classList.remove("drag-hover");
	});
}

export function createDropzoneForExternalOnly(element) {
	// mark as valid drop zone
	element.addEventListener("dragover", block);
	element.addEventListener("dragenter", function (e) {
		// only allow external files to be dropped
		if (e?.dataTransfer?.types[0] === "Files" || e?.dataTransfer?.types[0] === "out") {
			this.classList.add("drag-hover");
		} else {
			this.classList.remove("drag-hover");
		}
	});

	element.addEventListener("dragend", function (e) {
		e.dataTransfer.effectAllowed = "none";
		this.classList.remove("drag-hover");
	});

	element.addEventListener("dragleave", function (e) {
		e.dataTransfer.effectAllowed = "none";
		this.classList.remove("drag-hover");
	});

	element.addEventListener("drop", function (e) {
		e.preventDefault();
	});
}

function block(e) {
	e.preventDefault();
	e.stopPropagation();
}

function block_2(e) {
	e.preventDefault();
	e.stopPropagation();
	this.classList.add("drag-hover");
}
