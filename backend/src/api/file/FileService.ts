/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { createReadStream } from 'fs';

import { EntityManager } from '@mikro-orm/mariadb';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';
import { IFileRepository } from 'src/api/file/IFileRepository';
import { IFileService } from 'src/api/file/IFileService';
import { FileDeleteDto } from 'src/api/file/mapping/delete';
import { FileDownloadDto, FileDownloadResponse } from 'src/api/file/mapping/download';
import { FileMetadataDto, FileMetadataResponse } from 'src/api/file/mapping/metadata';
import { FileRenameDto } from 'src/api/file/mapping/rename';
import { FileReplaceDto, FileReplaceResponse } from 'src/api/file/mapping/replace';
import { FileUploadDto, FileUploadResponse } from 'src/api/file/mapping/upload';
import { StoragePath } from 'src/disk/DiskService';
import { FileAlreadyExistsException, FileNotFoundException, ParentDirectoryNotFoundException } from 'src/exceptions';
import { FileUtils } from 'src/util/FileUtils';
import { PathUtils } from 'src/util/PathUtils';

/**
 * Service for CRUD operations on file entities.
 * @class
 */
@Injectable()
export class FileService implements IFileService {
	/**
	 * The entity manager for executing transactions on repositories.
	 * @type {EntityManager}
	 */
	private readonly entityManager: EntityManager;

	/**
	 * The config service for using environment variables.
	 * @type {ConfigService}
	 */
	private readonly configService: ConfigService;

	/**
	 * The repository for executing file operations on the db.
	 * @type {IFileRepository}
	 */
	private readonly fileRepository: IFileRepository;

	/**
	 * The repository for executing directory operations on the db.
	 * @type {IDirectoryRepository}
	 */
	private readonly directoryRepository: IDirectoryRepository;

	/**
	 * Creates a new FileService instance.
	 * @constructor
	 *
	 * @param   {EntityManager}        entityManager       the entityManager
	 * @param   {ConfigService}        configService       the configService
	 * @param   {IFileRepository}      fileRepository      the fileRepository
	 * @param   {IDirectoryRepository} directoryRepository the directoryRepository
	 * @returns {FileService}                              the FileService instance
	 */
	public constructor(
		entityManager: EntityManager,
		configService: ConfigService,
		@Inject(IFileRepository) fileRepository: IFileRepository,
		@Inject(IDirectoryRepository) directoryRepository: IDirectoryRepository
	) {
		this.entityManager = entityManager;
		this.configService = configService;
		this.fileRepository = fileRepository;
		this.directoryRepository = directoryRepository;
	}

	public async upload(fileUploadDto: FileUploadDto): Promise<FileUploadResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (await this.fileRepository.exists(entityManager, fileUploadDto.parentId, fileUploadDto.name)) {
				throw new FileAlreadyExistsException(fileUploadDto.name);
			}

			if (!(await this.directoryRepository.exists(entityManager, fileUploadDto.parentId))) {
				throw new ParentDirectoryNotFoundException(fileUploadDto.parentId);
			}

			const id = await this.fileRepository.insertReturningId(
				entityManager,
				fileUploadDto.parentId,
				fileUploadDto.name,
				fileUploadDto.mimeType,
				fileUploadDto.size
			);

			const resolvedPath = PathUtils.join(this.configService, StoragePath.Data, PathUtils.uuidToDirPath(id));
			await FileUtils.writeFile(resolvedPath, fileUploadDto.buffer);

			return FileUploadResponse.from(id);
		});
	}

	public async replace(fileReplaceDto: FileReplaceDto): Promise<FileReplaceResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (!(await this.directoryRepository.exists(entityManager, fileReplaceDto.parentId))) {
				throw new ParentDirectoryNotFoundException(fileReplaceDto.parentId);
			}

			if (await this.fileRepository.exists(entityManager, fileReplaceDto.parentId, fileReplaceDto.name)) {
				await this.fileRepository.delete(entityManager, fileReplaceDto.parentId, fileReplaceDto.name);
			}

			const id = await this.fileRepository.insertReturningId(
				entityManager,
				fileReplaceDto.parentId,
				fileReplaceDto.name,
				fileReplaceDto.mimeType,
				fileReplaceDto.size
			);

			const resolvedPath = PathUtils.join(this.configService, StoragePath.Data, PathUtils.uuidToDirPath(id));
			await FileUtils.writeFile(resolvedPath, fileReplaceDto.buffer);

			return FileUploadResponse.from(id);
		});
	}

	public async metadata(fileMetadataDto: FileMetadataDto): Promise<FileMetadataResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			const metadata = await this.fileRepository.getMetadata(entityManager, fileMetadataDto.id);

			if (!metadata) {
				throw new FileNotFoundException(fileMetadataDto.id);
			}

			return FileMetadataResponse.from(metadata);
		});
	}

	public async download(fileDownloadDto: FileDownloadDto): Promise<FileDownloadResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			const { name, mimeType } = (await this.fileRepository.getNameAndMimeType(entityManager, fileDownloadDto.id)) || {};

			if (!name || !mimeType) {
				throw new FileNotFoundException(fileDownloadDto.id);
			}

			const diskPath = PathUtils.join(this.configService, StoragePath.Data, PathUtils.uuidToDirPath(fileDownloadDto.id));

			return FileDownloadResponse.from(name, mimeType, createReadStream(diskPath));
		});
	}

	public async rename(fileRenameDto: FileRenameDto): Promise<void> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (!(await this.fileRepository.exists(entityManager, fileRenameDto.id))) {
				throw new FileNotFoundException(fileRenameDto.id);
			}

			const parentId = await this.fileRepository.getParentId(entityManager, fileRenameDto.id);

			if (!parentId) {
				throw new ParentDirectoryNotFoundException(fileRenameDto.id);
			}

			if (await this.fileRepository.exists(entityManager, parentId, fileRenameDto.name)) {
				throw new FileAlreadyExistsException(fileRenameDto.name);
			}

			await this.fileRepository.update(entityManager, fileRenameDto.id, { name: fileRenameDto.name });
		});
	}

	public async delete(fileDeleteDto: FileDeleteDto): Promise<void> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (!(await this.fileRepository.exists(entityManager, fileDeleteDto.id))) {
				throw new FileNotFoundException(fileDeleteDto.id);
			}

			await this.fileRepository.delete(entityManager, fileDeleteDto.id);

			const resolvedPath = PathUtils.join(this.configService, StoragePath.Data, PathUtils.uuidToDirPath(fileDeleteDto.id));

			await FileUtils.deleteFile(resolvedPath);
		});
	}
}
