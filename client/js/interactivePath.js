import { setCookie } from "./cookies.js";

export default function setInteractivePath(value) {
	let interactivePathElement = document.querySelector("#interactive-path");
	interactivePathElement.replaceChildren();

	let parts = value.match(/(^\/)|([^\/]+)/gim);

	for (let part of parts) {
		let component = createInteractivePathComponent(part);
		interactivePathElement.append(component);

		component.querySelector(".value").addEventListener("click", function (event) {
			let interactivePathComponent = this.closest(".interactive-path-component");

			if (interactivePathElement.lastChild !== interactivePathComponent) {
				let newPath = getCompleteRelativePathFromInteractivePathComponent(interactivePathComponent);
			}
		});
	}
}

function createInteractivePathComponent(value) {
	let template = document.querySelector("#interactive-path-component-template");
	let interactivePathComponent = template.content.cloneNode(true).querySelector("div.interactive-path-component");
	interactivePathComponent.querySelector(".value").innerText = value;

	return interactivePathComponent;
}

function getCompleteRelativePathFromInteractivePathComponent(interactivePathComponent) {
	let componentValues = document.querySelectorAll("#interactive-path div.interactive-path-component .value");
	componentValues = Array.from(componentValues).map(component => component.innerText);
	let stopValue = interactivePathComponent.querySelector(".value").innerText;

	let path = "";
	for (let value of componentValues) {
		path += value === "/" ? value : value + "/";

		if (value === stopValue) {
			break;
		}
	}

	return path;
}
