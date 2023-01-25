import { Socket } from "socket.io";
import path from "path";
import * as fs from "fs";

export default async function renameDirectory(socket: Socket, defaultDirectoryPath: string, oldPath: string, newPath: string) {
	let fullOldPath = path.join(defaultDirectoryPath, oldPath);
	let fullNewPath = path.join(defaultDirectoryPath, newPath);
	await fs.promises.rename(fullOldPath, fullNewPath);
}
