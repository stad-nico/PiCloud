export default function getFolderElementByPath(path) {
	return Array.from(document.querySelectorAll(".collapsable-folder-structure-element")).find(
		folder => folder.querySelector(".path").innerText === path
	);
}
