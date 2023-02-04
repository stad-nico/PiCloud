import { Request, Response } from "express";
import { Socket } from "socket.io";

const { randomUUID } = require("crypto");
const fs = require("fs");
const express = require("express");
const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const path = require("path");

import sendDirectoryContents from "./src/sendDirectoryContents";
import sendDirectoryFolderStructureRecursive from "./src/sendDirectoryFolderStructure";
import createDirectory from "./src/createDirectory";
import deleteDirectory from "./src/deleteDirectory";
import renameDirectory from "./src/renameDirectory";

let dpath = "C:/Users/stadl/Desktop/File-Server/files/";

fs.watch(dpath, { recursive: true }, function (event, name) {
	console.info("change in directory detected; sending updates to sockets");
	io.sockets.emit("reload");
});

app.use(express.static(path.join(__dirname, "..", "client")));

app.get("*", function (req: Request, res: Response) {
	res.sendFile("index.html", {
		root: path.join(__dirname, "..", "client"),
	});
});

app.get("/download", function (req: Request, res: Response) {
	let fullPath = path.join(dpath, req.query.path);
	let filename = fullPath.match(/[^/\\]+$/im)[0];
	console.log(fullPath, filename);
	res.download(fullPath, filename, { dotfiles: "allow" });
});

io.on("connection", function (socket: Socket) {
	console.log("A user connected");

	socket.emit("get-uuid", uuid => {
		if (uuid) {
			console.log("identified: " + uuid);
		} else {
			uuid = randomUUID();
			console.log("registered new: " + uuid);
			socket.emit("store-uuid", uuid);
		}
	});

	socket.on("is-path-valid", async (relPath: string, callback: (valid?: boolean) => void) => {
		callback(fs.existsSync(path.join(dpath, relPath)));
	});

	socket.on("send-directory-folder-structure-recursive", async (relPath: string, callback?: (error?: unknown) => void) => {
		try {
			await sendDirectoryFolderStructureRecursive(socket, dpath, relPath);
			callback && callback();
		} catch (error) {
			callback && callback(error);
			console.log(error);
		}
	});

	socket.on("send-directory-contents", async (relPath: string, callback?: (error?: unknown) => void) => {
		try {
			await sendDirectoryContents(socket, dpath, relPath);
			callback && callback();
		} catch (error) {
			callback && callback(error);
			console.log(error);
		}
	});

	socket.on("create-directory", async (relPath: string, callback?: (error?: unknown) => void) => {
		try {
			await createDirectory(socket, dpath, relPath);
			callback && callback();
		} catch (error) {
			callback && callback(error);
			console.log(error);
		}
	});

	socket.on("delete-directory", async (relPath: string, callback: (error?: unknown) => void) => {
		try {
			await deleteDirectory(socket, dpath, relPath);
			callback && callback();
		} catch (error) {
			callback && callback(error);
			console.log(error);
		}
	});

	socket.on("rename-directory", async (oldPath: string, newPath: string, callback: (error?: unknown) => void) => {
		try {
			await renameDirectory(socket, dpath, oldPath, newPath);
			callback && callback();
		} catch (error) {
			callback && callback(error);
			console.log(error);
		}
	});

	socket.on("disconnect", function () {
		console.log("A user disconnected");
	});
});

http.listen(3000, function () {
	console.log("listening on *:3000");
});
