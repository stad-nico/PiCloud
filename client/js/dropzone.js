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
		e.dataTransfer.setData("path", this.querySelector(".path").innerText);
		e.dataTransfer.setData("class", this.getAttribute("data-drag-class"), "");

		e.dataTransfer.effectAllowed = "all";
		e.dataTransfer.setDragImage(this.querySelector(".file-icon") || this.querySelector(".folder-icon"), 0, 0);
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
		let oldPath = e.dataTransfer.getData("path");
		let o = oldPath.match(/[^\/]+\/$/gim)[0];
		let newPath = this.querySelector(".path").innerText + o;

		if (oldPath === newPath) {
			return;
		}

		window.socket.emit("rename-directory", oldPath, newPath, function (error) {
			if (error) {
				console.log(error);
			} else {
				console.log("successfully moved directory");
			}
		});
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

		this.classList.remove("drag-hover");

		let oldPath = e.dataTransfer.getData("path");
		let o = oldPath.match(/[^\/]+\/$/gim)[0];
		let newPath = window.location.pathname + o;

		if (oldPath === newPath) {
			return;
		}

		window.socket.emit("rename-directory", oldPath, newPath, function (error) {
			if (error) {
				console.log(error);
			} else {
				console.log("successfully moved directory");
			}
		});
	});

	let content = element.querySelector("#contents");

	content.addEventListener("dragenter", function (e) {
		e.stopPropagation();
		this.closest("#directory-contents").removeEventListener("dragover", block);
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
