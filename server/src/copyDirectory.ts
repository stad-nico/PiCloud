import path from "path";
import * as fs from "fs";
import { Socket } from "socket.io";

export default async function copyDirectory(socket: Socket, defaultDirectoryPath: string, src: string, dest: string, force: boolean = false) {
	// will throw an error if dest already exists
	await fs.promises.cp(path.join(defaultDirectoryPath, src), path.join(defaultDirectoryPath, dest), {
		errorOnExist: true,
		force: force,
	});
}
