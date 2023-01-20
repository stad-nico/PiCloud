const path = require("path");
import { Socket } from "socket.io";

import FileStats from "./FileStats";
import FolderStats from "./FolderStats";

import { getContentNames, createStatsObject } from "./fsHelpers";
import isNodeJSErrnoException from "./isNodeJSErrnoException";
import sendErrorMessageToSocket from "./sendErrorMessageToSocket";

export default async function sendDirectoryContents(socket: Socket, defaultDirectoryPath: string, relativePath: string) {
	try {
		let absolutePath = path.join(defaultDirectoryPath, relativePath);
		let data: (FileStats | FolderStats)[] = [];

		let names = await getContentNames(absolutePath);

		for (let name of names) {
			data.push(await createStatsObject(defaultDirectoryPath, relativePath, name));
		}

		socket.emit("receive-directory-contents", data);
	} catch (error) {
		if (isNodeJSErrnoException(error)) {
			sendErrorMessageToSocket(socket, error.toString(), error.errno, error.code);
		}
	}
}
