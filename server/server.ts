import { Request, Response } from "express";
import { Socket } from "socket.io";

const express = require("express");
const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const path = require("path");
const sendDirectoryContents = require("./src/sendDirectoryContents");
const sendDirectoryFolderStructure = require("./src/sendDirectoryFolderStructure");

let dpath = "../../";

app.get("/", function (req: Request, res: Response) {
	res.sendFile(path.join(__dirname, "../client", "index.html"));
});

app.use(express.static(path.join(__dirname, "../client")));

app.get("/download", function (req: Request, res: Response) {
	res.download(path.join(__dirname, dpath + req.query.path));
});

io.on("connection", function (socket: Socket) {
	console.log("A user connected");

	socket.on("send-directory-folder-structure", (relPath: string) => {
		sendDirectoryFolderStructure(socket, path.join(__dirname, dpath), relPath);
	});

	socket.on("send-directory-contents", (relPath: string) => {
		sendDirectoryContents(socket, path.join(__dirname, dpath), relPath);
	});

	socket.on("disconnect", function () {
		console.log("A user disconnected");
	});
});

http.listen(3000, function () {
	console.log("listening on *:3000");
});
