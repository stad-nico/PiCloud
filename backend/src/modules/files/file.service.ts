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
import { DirectoryNotFoundException } from 'src/modules/directories/exceptions/directory-not-found.exception';
import { StoragePath } from 'src/modules/disk/DiskService';
import { FileAlreadyExistsException } from 'src/modules/files/exceptions/file-already-exists.exception';
import { FileNotFoundException } from 'src/modules/files/exceptions/file-not-found.exception';
import { FileRepository } from 'src/modules/files/file.repository';
import { DeleteFileDto } from 'src/modules/files/mapping/delete/delete-file.dto';
import { DownloadFileDto } from 'src/modules/files/mapping/download/download-file.dto';
import { DownloadFileResponse } from 'src/modules/files/mapping/download/download-file.response';
import { GetFileMetadataDto } from 'src/modules/files/mapping/metadata/get-file-metadata.dto';
import { GetFileMetadataResponse } from 'src/modules/files/mapping/metadata/get-file-metadata.response';
import { RenameFileDto } from 'src/modules/files/mapping/rename/rename-file.dto';
import { ReplaceFileDto } from 'src/modules/files/mapping/replace/replace-file.dto';
import { ReplaceFileResponse } from 'src/modules/files/mapping/replace/replace-file.response';
import { UploadFileDto } from 'src/modules/files/mapping/upload/upload-file.dto';
import { UploadFileResponse } from 'src/modules/files/mapping/upload/upload-file.response';
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
	public async upload(uploadFileDto: UploadFileDto): Promise<UploadFileResponse> {
		const directory = await this.directoryRepository.findOne({ id: uploadFileDto.parentId });

		if (directory?.user.id !== uploadFileDto.userId) {
			throw new DirectoryNotFoundException(uploadFileDto.parentId);
		}

		const existingFile = await this.fileRepository.findOne({
			name: uploadFileDto.name,
			parent: uploadFileDto.parentId,
			user: uploadFileDto.userId,
		});

		if (existingFile) {
			throw new FileAlreadyExistsException(uploadFileDto.name);
		}

		const file = this.fileRepository.create({
			name: uploadFileDto.name,
			size: uploadFileDto.size,
			mimeType: uploadFileDto.mimeType,
			parent: directory,
			user: uploadFileDto.userId,
		});

		await this.directoryRepository.nativeUpdate({ id: directory.id }, { updatedAt: new Date() });

		const resolvedPath = PathUtils.join(this.configService, StoragePath.Data, PathUtils.uuidToDirPath(file.id));
		await FileUtils.writeFile(resolvedPath, uploadFileDto.content);

		return UploadFileResponse.from(file.id);
	}

	@Transactional()
	public async replace(replaceFileDto: ReplaceFileDto): Promise<ReplaceFileResponse> {
		const directory = await this.directoryRepository.findOne({ id: replaceFileDto.parentId });

		if (directory?.user.id !== replaceFileDto.userId) {
			throw new DirectoryNotFoundException(replaceFileDto.parentId);
		}

		const existingFile = await this.fileRepository.findOne({
			name: replaceFileDto.name,
			parent: replaceFileDto.parentId,
			user: replaceFileDto.userId,
		});

		const file = existingFile
			? existingFile
			: this.fileRepository.create({
					name: replaceFileDto.name,
					size: replaceFileDto.size,
					mimeType: replaceFileDto.mimeType,
					parent: directory,
					user: replaceFileDto.userId,
				});

		await this.directoryRepository.nativeUpdate({ id: directory.id }, { updatedAt: new Date() });

		const resolvedPath = PathUtils.join(this.configService, StoragePath.Data, PathUtils.uuidToDirPath(file.id));
		await FileUtils.writeFile(resolvedPath, replaceFileDto.content);

		return ReplaceFileResponse.from(file.id);
	}

	@Transactional()
	public async metadata(getFileMetadataDto: GetFileMetadataDto): Promise<GetFileMetadataResponse> {
		const file = await this.fileRepository.findOne({ id: getFileMetadataDto.id });

		if (file?.user.id !== getFileMetadataDto.userId) {
			throw new FileNotFoundException(getFileMetadataDto.id);
		}

		return GetFileMetadataResponse.from(file);
	}

	@Transactional()
	public async download(downloadFileDto: DownloadFileDto): Promise<DownloadFileResponse> {
		const file = await this.fileRepository.findOne({ id: downloadFileDto.id });

		if (file?.user.id !== downloadFileDto.userId) {
			throw new FileNotFoundException(downloadFileDto.id);
		}

		const diskPath = PathUtils.join(this.configService, StoragePath.Data, PathUtils.uuidToDirPath(file.id));

		return DownloadFileResponse.from(file.name, file.mimeType, createReadStream(diskPath));
	}

	@Transactional()
	public async rename(renameFileDto: RenameFileDto): Promise<void> {
		const file = await this.fileRepository.findOne({ id: renameFileDto.id });

		if (file?.user.id !== renameFileDto.userId) {
			throw new FileNotFoundException(renameFileDto.id);
		}

		const existingFile = await this.fileRepository.findOne({ parent: file.parent, name: renameFileDto.name });

		if (existingFile) {
			throw new FileAlreadyExistsException(renameFileDto.name);
		}

		await this.fileRepository.nativeUpdate({ id: file.id }, { name: renameFileDto.name });

		await this.directoryRepository.nativeUpdate({ id: file.parent.id }, { updatedAt: new Date() });
	}

	@Transactional()
	public async delete(deleteFileDto: DeleteFileDto): Promise<void> {
		const file = await this.fileRepository.findOne({ id: deleteFileDto.id });

		if (file?.user.id !== deleteFileDto.userId) {
			throw new FileNotFoundException(deleteFileDto.id);
		}

		await this.fileRepository.nativeDelete({ id: file.id });

		await this.directoryRepository.nativeUpdate({ id: file.parent.id }, { updatedAt: new Date() });
	}
}
