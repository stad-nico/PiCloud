import { Socket } from "socket.io";

const fs = require("fs");
const path = require("path");

module.exports = function sendDirectoryFolderStructure(socket: Socket, defaultDirectoryPath: string, relativePath: string) {
	let absolutePath = path.join(defaultDirectoryPath, relativePath);
	let contentNames: string[] = fs.readdirSync(absolutePath);

	let folderNames = contentNames.filter((name: string) => {
		let fsStats = fs.statSync(path.join(absolutePath, name));
		return fsStats.isDirectory();
	});

	socket.emit("receive-directory-folder-structure", {
		path: relativePath,
		folderNames: folderNames,
	});
};
