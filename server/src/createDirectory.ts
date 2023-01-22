import path from "path";
import * as fs from "fs";
import { Socket } from "socket.io";

export default async function createDirectory(socket: Socket, defaultDirectoryPath: string, newDirectoryRelPath: string) {
	let fullPath = path.join(defaultDirectoryPath, newDirectoryRelPath);
	await fs.promises.mkdir(fullPath);
}
