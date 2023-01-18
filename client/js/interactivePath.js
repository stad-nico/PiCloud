import { setCookie, getCookie } from "./cookies.js";

export default function updateInteractivePath() {
	document.title = getCookie("path");

	let template = document.querySelector("#interactive-path-element-template");

	let pathElem = document.querySelector("#interactive-path");
	pathElem.replaceChildren();

	let elem = template.content.cloneNode(true);
	elem.querySelector(".value").innerText = "/";
	elem.querySelector(".interactive-path-element .value").addEventListener("click", function () {
		setCookie("path", "/");
		window.socket.emit("send-directory-contents", getCookie("path"));
		updateInteractivePath();
	});

	pathElem.appendChild(elem);

	let path = getCookie("path").replaceAll(/\\/g, "/");
	path.split("/")
		.filter(x => x.length > 0)
		.forEach(piece => {
			let elem = template.content.cloneNode(true);
			elem.querySelector(".value").innerText = piece;
			elem.querySelector(".interactive-path-element .value").addEventListener("click", function () {
				setCookie("path", getFullRelativePathFromPathElement(this));
				window.socket.emit("send-directory-contents", getCookie("path"));
				updateInteractivePath();
			});

			pathElem.appendChild(elem);
		});
}

function getFullRelativePathFromPathElement(pathElement) {
	let children = document.querySelector("#interactive-path").children;
	let stopValue = pathElement.innerText;

	let path = "";
	for (let i = 0; i < children.length; i++) {
		let currentValue = children[i].querySelector(".value").innerText;

		if (currentValue === "/") {
			continue;
		}

		path += "/" + currentValue;

		if (currentValue === stopValue) {
			break;
		}
	}

	return path + "/";
}
