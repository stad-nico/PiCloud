const path = require("path");
import * as fs from "fs";

import FolderStats from "./FolderStats";
import FileStats from "./FileStats";

export async function createStatsObject(defaultDirectoryPath: string, relativePath: string, name: string): Promise<FileStats | FolderStats> {
	let namePath = path.join(relativePath, name);
	let fullPath = path.join(defaultDirectoryPath, namePath);

	let stats = await getFileStats(fullPath);

	if (stats.isDirectory()) {
		return new FolderStats(name, namePath + "\\");
	} else if (stats.isFile()) {
		return new FileStats(name, await getFileSize(fullPath), namePath);
	} else {
		throw new Error("path is neither a file nor a directory");
	}
}

export async function getFileSize(absolutePath: string) {
	return (await getFileStats(absolutePath)).size;
}

export async function getContentNames(absoluteDirectoryPath: string) {
	return await fs.promises.readdir(absoluteDirectoryPath);
}

export async function getFileStats(absolutePath: string): Promise<fs.Stats> {
	return await fs.promises.stat(absolutePath);
}

export async function hasSubDirectories(absoluteDirectoryPath: string): Promise<boolean> {
	let names = await getContentNames(absoluteDirectoryPath);

	for (let name of names) {
		if ((await getFileStats(path.join(absoluteDirectoryPath, name))).isDirectory()) {
			return true;
		}
	}

	return false;
}
