import * as fs from "fs";
const path = require("path");
import { Socket } from "socket.io";

import sendErrorMessageToSocket from "./sendErrorMessageToSocket";

import { getContentNames, getFileStats, hasSubDirectories } from "./fsHelpers";
import isNodeJSErrnoException from "./isNodeJSErrnoException";

export default async function sendDirectoryFolderStructure(socket: Socket, defaultDirectoryPath: string, relativePath: string) {
	try {
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
	} catch (error) {
		if (isNodeJSErrnoException(error)) {
			sendErrorMessageToSocket(socket, error.toString(), error.errno, error.code);
		}
	}
}
