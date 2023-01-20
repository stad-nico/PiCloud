import { Socket } from "socket.io";

export default async function sendErrorMessageToSocket(socket: Socket, message: string, number?: number, code?: string) {
	socket.emit("receive-error", {
		message: message,
		number: number,
		code: code,
	});
}
