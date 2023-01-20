import path from "path";
import * as fs from "fs";
import { Socket } from "socket.io";

import sendErrorMessageToSocket from "./sendErrorMessageToSocket";
import isNodeJSErrnoException from "./isNodeJSErrnoException";

export default async function createDirectory(socket: Socket, defaultDirectoryPath: string, newDirectoryRelPath: string) {
	let fullPath = path.join(defaultDirectoryPath, newDirectoryRelPath);

	try {
		await fs.promises.mkdir(fullPath);
	} catch (error) {
		if (isNodeJSErrnoException(error)) {
			sendErrorMessageToSocket(socket, error.toString(), error.errno, error.code);
		}
	}
}
