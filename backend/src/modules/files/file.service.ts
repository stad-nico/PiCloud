/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Transactional } from '@mikro-orm/mariadb';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';
import { DirectoryRepository } from 'src/modules/directories/directory.repository';
import { DirectoryNotFoundException } from 'src/modules/directories/exceptions/DirectoryNotFoundException';
import { StoragePath } from 'src/modules/disk/DiskService';
import { FileRenameDto } from 'src/modules/files//mapping/rename';
import { FileAlreadyExistsException } from 'src/modules/files/exceptions/FileAlreadyExistsException';
import { FileNotFoundException } from 'src/modules/files/exceptions/FileNotFoundException';
import { FileRepository } from 'src/modules/files/file.repository';
import { FileDeleteDto } from 'src/modules/files/mapping/delete';
import { FileDownloadDto, FileDownloadResponse } from 'src/modules/files/mapping/download';
import { FileMetadataDto, FileMetadataResponse } from 'src/modules/files/mapping/metadata';
import { FileReplaceDto, FileReplaceResponse } from 'src/modules/files/mapping/replace';
import { FileUploadDto, FileUploadResponse } from 'src/modules/files/mapping/upload';
import { FileUtils } from 'src/util/FileUtils';
import { PathUtils } from 'src/util/PathUtils';

@Injectable()
export class FileService {
	public constructor(
		private readonly configService: ConfigService,
		private readonly fileRepository: FileRepository,
		private readonly directoryRepository: DirectoryRepository
	) {}

	@Transactional()
	public async upload(fileUploadDto: FileUploadDto): Promise<FileUploadResponse> {
		const directory = await this.directoryRepository.findOne({ id: fileUploadDto.parentId });

		if (directory?.user.id !== fileUploadDto.userId) {
			throw new DirectoryNotFoundException(fileUploadDto.parentId);
		}

		const existingFile = await this.fileRepository.findOne({
			name: fileUploadDto.name,
			parent: fileUploadDto.parentId,
			user: fileUploadDto.userId,
		});

		if (existingFile) {
			throw new FileAlreadyExistsException(fileUploadDto.name);
		}

		const file = this.fileRepository.create({
			name: fileUploadDto.name,
			size: fileUploadDto.size,
			mimeType: fileUploadDto.mimeType,
			parent: directory,
			user: fileUploadDto.userId,
		});

		await this.directoryRepository.nativeUpdate({ id: directory.id }, { updatedAt: new Date() });

		const resolvedPath = PathUtils.join(this.configService, StoragePath.Data, PathUtils.uuidToDirPath(file.id));
		await FileUtils.writeFile(resolvedPath, fileUploadDto.content);

		return FileUploadResponse.from(file.id);
	}

	@Transactional()
	public async replace(fileReplaceDto: FileReplaceDto): Promise<FileReplaceResponse> {
		const directory = await this.directoryRepository.findOne({ id: fileReplaceDto.parentId });

		if (directory?.user.id !== fileReplaceDto.userId) {
			throw new DirectoryNotFoundException(fileReplaceDto.parentId);
		}

		const existingFile = await this.fileRepository.findOne({
			name: fileReplaceDto.name,
			parent: fileReplaceDto.parentId,
			user: fileReplaceDto.userId,
		});

		const file = existingFile
			? existingFile
			: this.fileRepository.create({
					name: fileReplaceDto.name,
					size: fileReplaceDto.size,
					mimeType: fileReplaceDto.mimeType,
					parent: directory,
					user: fileReplaceDto.userId,
				});

		await this.directoryRepository.nativeUpdate({ id: directory.id }, { updatedAt: new Date() });

		const resolvedPath = PathUtils.join(this.configService, StoragePath.Data, PathUtils.uuidToDirPath(file.id));
		await FileUtils.writeFile(resolvedPath, fileReplaceDto.content);

		return FileUploadResponse.from(file.id);
	}

	@Transactional()
	public async metadata(fileMetadataDto: FileMetadataDto): Promise<FileMetadataResponse> {
		const file = await this.fileRepository.findOne({ id: fileMetadataDto.id });

		if (file?.user.id !== fileMetadataDto.userId) {
			throw new FileNotFoundException(fileMetadataDto.id);
		}

		return FileMetadataResponse.from(file);
	}

	@Transactional()
	public async download(fileDownloadDto: FileDownloadDto): Promise<FileDownloadResponse> {
		const file = await this.fileRepository.findOne({ id: fileDownloadDto.id });

		if (file?.user.id !== fileDownloadDto.userId) {
			throw new FileNotFoundException(fileDownloadDto.id);
		}

		const diskPath = PathUtils.join(this.configService, StoragePath.Data, PathUtils.uuidToDirPath(file.id));

		return FileDownloadResponse.from(file.name, file.mimeType, createReadStream(diskPath));
	}

	@Transactional()
	public async rename(fileRenameDto: FileRenameDto): Promise<void> {
		const file = await this.fileRepository.findOne({ id: fileRenameDto.id });

		if (file?.user.id !== fileRenameDto.userId) {
			throw new FileNotFoundException(fileRenameDto.id);
		}

		const existingFile = await this.fileRepository.findOne({ parent: file.parent, name: fileRenameDto.name });

		if (existingFile) {
			throw new FileAlreadyExistsException(fileRenameDto.name);
		}

		await this.fileRepository.nativeUpdate({ id: file.id }, { name: fileRenameDto.name });

		await this.directoryRepository.nativeUpdate({ id: file.parent.id }, { updatedAt: new Date() });
	}

	@Transactional()
	public async delete(fileDeleteDto: FileDeleteDto): Promise<void> {
		const file = await this.fileRepository.findOne({ id: fileDeleteDto.id });

		if (file?.user.id !== fileDeleteDto.userId) {
			throw new FileNotFoundException(fileDeleteDto.id);
		}

		await this.fileRepository.nativeDelete({ id: file.id });

		await this.directoryRepository.nativeUpdate({ id: file.parent.id }, { updatedAt: new Date() });
	}
}
