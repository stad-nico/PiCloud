import * as fs from "fs";
const path = require("path");
import { Socket } from "socket.io";

import FileStats from "./FileStats";
import FolderStats from "./FolderStats";

import { getContentNames, getFileStats, hasSubDirectories } from "./fsHelpers";

module.exports = async function sendDirectoryFolderStructure(socket: Socket, defaultDirectoryPath: string, relativePath: string) {
	let absolutePath = path.join(defaultDirectoryPath, relativePath);
	let folderObjects: { name: string; hasSubDirectories: boolean }[] = [];

	let names = await getContentNames(absolutePath);

	for (let name of names) {
		if ((await getFileStats(path.join(absolutePath, name))).isDirectory()) {
			folderObjects.push({
				name: name,
				hasSubDirectories: await hasSubDirectories(path.join(absolutePath, name)),
			});
		}
	}

	socket.emit("receive-directory-folder-structure", {
		path: relativePath,
		folderObjects: folderObjects,
	});
};
