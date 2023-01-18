import * as fs from "fs";
const path = require("path");
import { Socket } from "socket.io";

import FileStats from "./FileStats";
import FolderStats from "./FolderStats";

import { getContentNames, createStatsObject } from "./fsHelpers";

module.exports = async function sendDirectoryContents(socket: Socket, defaultDirectoryPath: string, relativePath: string) {
	let absolutePath = path.join(defaultDirectoryPath, relativePath);
	let data: (FileStats | FolderStats)[] = [];

	let names = await getContentNames(absolutePath);

	for (let name of names) {
		data.push(await createStatsObject(absolutePath, name));
	}

	socket.emit("receive-directory-contents", data);
};
