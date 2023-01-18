import { Socket } from "socket.io";

const fs = require("fs");
const path = require("path");

module.exports = function sendDirectoryFolderStructure(socket: Socket, defaultDirectoryPath: string, relativePath: string) {
	let absolutePath = path.join(defaultDirectoryPath, relativePath);
	let folderObjects: { name: string; hasSubDirectories: boolean }[] = [];

	let contentNames: string[] = fs.readdirSync(absolutePath);

	let folderNames = contentNames.filter((name: string) => {
		let fsStats = fs.statSync(path.join(absolutePath, name));
		return fsStats.isDirectory();
	});

	folderNames.forEach(name => {
		let folderNames = fs
			.readdirSync(path.join(absolutePath, name))
			.filter((elemName: string) => fs.statSync(path.join(absolutePath, name, elemName)).isDirectory());

		folderObjects.push({
			name: name,
			hasSubDirectories: folderNames.length !== 0,
		});
	});

	socket.emit("receive-directory-folder-structure", {
		path: relativePath,
		folderObjects: folderObjects,
	});
};
