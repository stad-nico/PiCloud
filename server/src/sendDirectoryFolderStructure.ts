import * as fs from "fs";
const path = require("path");
import { Socket } from "socket.io";

import sendErrorMessageToSocket from "./sendErrorMessageToSocket";

import { getContentNames, getFileStats, hasSubDirectories } from "./fsHelpers";
import isNodeJSErrnoException from "./isNodeJSErrnoException";

type FolderObject = {
	name: string;
	path: string;
	hasSubDirectories: boolean;
	contents?: FolderObject[];
};

export default async function sendDirectoryFolderStructureRecursive(socket: Socket, defaultDirectoryPath: string, relativePath: string) {
	try {
		let folderObjects: FolderObject[] = [];

		if (relativePath === "/") {
			var paths = [""];
		} else {
			var paths = relativePath.replace(/\/$/gim, "").split("/");
		}

		let rel = "/";

		for (let part of paths) {
			rel = path.join(rel, part).replaceAll("\\", "/");
			folderObjects.push(await getDirectoryFolderStructure(defaultDirectoryPath, rel, true));
		}

		socket.emit("receive-directory-folder-structure-recursive", {
			folderObjects: folderObjects,
		});
	} catch (error) {
		if (isNodeJSErrnoException(error)) {
			sendErrorMessageToSocket(socket, error.toString(), error.errno, error.code);
		}
	}
}

async function getDirectoryFolderStructure(defaultDirectoryPath: string, relPath: string, includeContents: boolean = false) {
	let fullPath = path.join(defaultDirectoryPath, relPath);

	if (!(await getFileStats(fullPath)).isDirectory()) {
		throw Error("path not a directory");
	}

	let folderObject: FolderObject = {
		name: relPath.match(/([^\/]+(?=\/?$))|^\/$/gim)[0],
		path: relPath.endsWith("/") ? relPath : relPath + "/",
		hasSubDirectories: await hasSubDirectories(fullPath),
	};

	if (includeContents) {
		folderObject.contents = [];

		for (let name of await getContentNames(fullPath)) {
			if ((await getFileStats(path.join(fullPath, name))).isDirectory()) {
				folderObject.contents.push(
					await getDirectoryFolderStructure(defaultDirectoryPath, path.join(relPath, name).replaceAll("\\", "/"), false)
				);
			}
		}
	}

	return folderObject;
}
