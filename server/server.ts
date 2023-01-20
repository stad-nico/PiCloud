import { Request, Response } from "express";
import { Socket } from "socket.io";

const express = require("express");
const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const path = require("path");

import sendDirectoryContents from "./src/sendDirectoryContents";
import sendDirectoryFolderStructure from "./src/sendDirectoryFolderStructure";
import createDirectory from "./src/createDirectory";

let dpath = "C:/Users/stadl/Desktop/File-Server/files/";

app.get("/", function (req: Request, res: Response) {
	res.sendFile(path.join(__dirname, "../client", "index.html"));
});

app.use(express.static(path.join(__dirname, "../client")));

app.get("/download", function (req: Request, res: Response) {
	let fullPath = path.join(dpath, req.query.path);
	let filename = fullPath.match(/[^/]+$/im)[0];
	res.download(fullPath, filename, { dotfiles: "allow" });
});

io.on("connection", function (socket: Socket) {
	console.log("A user connected");

	socket.on("send-directory-folder-structure", async (relPath: string) => {
		await sendDirectoryFolderStructure(socket, dpath, relPath);
	});

	socket.on("send-directory-contents", async (relPath: string) => {
		await sendDirectoryContents(socket, dpath, relPath);
	});

	socket.on("create-directory", async (relPath: string) => {
		await createDirectory(socket, dpath, relPath);
	});

	socket.on("disconnect", function () {
		console.log("A user disconnected");
	});
});

http.listen(3000, function () {
	console.log("listening on *:3000");
});
