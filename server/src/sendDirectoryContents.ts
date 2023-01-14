import { Socket } from "socket.io";

const path = require("path");
const fs = require("fs");

import FileStats from "./FileStats";
import FolderStats from "./FolderStats";

module.exports = function sendDirectoryContents(socket: Socket, defaultDirectoryPath: string, relativePath: string) {
	let absolutePath = path.join(defaultDirectoryPath, relativePath);
	let data: (FileStats | FolderStats)[] = [];

	let contentNames: string[] = fs.readdirSync(absolutePath);
	contentNames.forEach((name: string) => {
		let fsStats = fs.statSync(path.join(absolutePath, name));

		let stats: FileStats | FolderStats;
		let p = path.join(relativePath, name);

		if (fsStats.isDirectory()) {
			stats = new FolderStats(name, p + "\\");
		} else {
			stats = new FileStats(name, fsStats.size, p);
		}

		data.push(stats);
	});

	socket.emit("receive-directory-contents", data);
};
