let createDirectoryButton = document.querySelector("#create-folder-icon");
createDirectoryButton.addEventListener("click", () => createDirectory());

export function createDirectory() {
	let template = document.querySelector("#directory-content-folder-template");

	let folder = template.content.cloneNode(true);
	folder.querySelector(".folder").classList.add("editable");

	let nameElement = folder.querySelector(".name");
	nameElement.setAttribute("contenteditable", true);
	nameElement.setAttribute("spellcheck", false);
	setTimeout(() => {
		nameElement.focus();
	}, 0);

	let container = document.querySelector("#directory-contents");
	container.scrollTop = 0;
	container.insertBefore(folder, container.firstChild);

	nameElement.addEventListener("keydown", function handler(event) {
		if (event.keyCode === 13) {
			event.preventDefault();

			if (this.innerText !== "") {
				this.removeAttribute("contenteditable");
				this.removeEventListener("keydown", handler);
				this.closest(".folder").classList.remove("editable");
			}
		}
	});

	document.addEventListener("mousedown", function handler(event) {
		let folder = document.querySelector(".folder.editable");
		let name = folder.querySelector(".name");

		if (name.innerText === "") {
			folder.parentNode.removeChild(folder);
		} else {
			name.removeAttribute("contenteditable");
		}
		folder.classList.remove("editable");
		this.removeEventListener("mousedown", handler);
	});

	// window.socket.emit("create-directory", name);
}
