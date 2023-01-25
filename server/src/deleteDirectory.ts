import { Socket } from "socket.io";
import * as fs from "fs";
import path from "path";

export default async function deleteDirectory(socket: Socket, defaultDirectoryPath: string, relPath: string) {
	let fullPath = path.join(defaultDirectoryPath, relPath);
	await fs.promises.rmdir(fullPath, { recursive: true });
}
