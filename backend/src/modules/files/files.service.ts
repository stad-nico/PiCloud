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

import { IDirectoriesRepository } from 'src/modules/directories/IDirectoriesRepository';
import { StoragePath } from 'src/modules/disk/DiskService';
import { FileRenameDto } from 'src/modules/files//mapping/rename';
import { IFilesRepository } from 'src/modules/files/IFilesRepository';
import { IFilesService } from 'src/modules/files/IFilesService';
import { FileDeleteDto } from 'src/modules/files/mapping/delete';
import { FileDownloadDto, FileDownloadResponse } from 'src/modules/files/mapping/download';
import { FileMetadataDto, FileMetadataResponse } from 'src/modules/files/mapping/metadata';
import { FileReplaceDto, FileReplaceResponse } from 'src/modules/files/mapping/replace';
import { FileUploadDto, FileUploadResponse } from 'src/modules/files/mapping/upload';
import { FileAlreadyExistsException, FileNotFoundException, ParentDirectoryNotFoundException } from 'src/shared/exceptions';
import { FileUtils } from 'src/util/FileUtils';
import { PathUtils } from 'src/util/PathUtils';

/**
 * Service for CRUD operations on file entities.
 * @class
 */
@Injectable()
export class FilesService implements IFilesService {
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
	 * @type {IFilesRepository}
	 */
	private readonly filesRepository: IFilesRepository;

	/**
	 * The repository for executing directory operations on the db.
	 * @type {IDirectoriesRepository}
	 */
	private readonly directoriesRepository: IDirectoriesRepository;

	/**
	 * Creates a new FileService instance.
	 * @constructor
	 *
	 * @param   {EntityManager}          entityManager         the entityManager
	 * @param   {ConfigService}          configService         the configService
	 * @param   {IFilesRepository}       filesRepository       the filesRepository
	 * @param   {IDirectoriesRepository} directoriesRepository the directoriesRepository
	 * @returns {FileService}                                  the FileService instance
	 */
	public constructor(
		entityManager: EntityManager,
		configService: ConfigService,
		@Inject(IFilesRepository) filesRepository: IFilesRepository,
		@Inject(IDirectoriesRepository) directoriesRepository: IDirectoriesRepository
	) {
		this.entityManager = entityManager;
		this.configService = configService;
		this.filesRepository = filesRepository;
		this.directoriesRepository = directoriesRepository;
	}

	public async upload(fileUploadDto: FileUploadDto): Promise<FileUploadResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (await this.filesRepository.exists(entityManager, fileUploadDto.parentId, fileUploadDto.name)) {
				throw new FileAlreadyExistsException(fileUploadDto.name);
			}

			if (!(await this.directoriesRepository.exists(entityManager, fileUploadDto.parentId))) {
				throw new ParentDirectoryNotFoundException(fileUploadDto.parentId);
			}

			const id = await this.filesRepository.insertReturningId(
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
			if (!(await this.directoriesRepository.exists(entityManager, fileReplaceDto.parentId))) {
				throw new ParentDirectoryNotFoundException(fileReplaceDto.parentId);
			}

			if (await this.filesRepository.exists(entityManager, fileReplaceDto.parentId, fileReplaceDto.name)) {
				await this.filesRepository.delete(entityManager, fileReplaceDto.parentId, fileReplaceDto.name);
			}

			const id = await this.filesRepository.insertReturningId(
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
			const metadata = await this.filesRepository.getMetadata(entityManager, fileMetadataDto.id);

			if (!metadata) {
				throw new FileNotFoundException(fileMetadataDto.id);
			}

			return FileMetadataResponse.from(metadata);
		});
	}

	public async download(fileDownloadDto: FileDownloadDto): Promise<FileDownloadResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			const { name, mimeType } = (await this.filesRepository.getNameAndMimeType(entityManager, fileDownloadDto.id)) || {};

			if (!name || !mimeType) {
				throw new FileNotFoundException(fileDownloadDto.id);
			}

			const diskPath = PathUtils.join(this.configService, StoragePath.Data, PathUtils.uuidToDirPath(fileDownloadDto.id));

			return FileDownloadResponse.from(name, mimeType, createReadStream(diskPath));
		});
	}

	public async rename(fileRenameDto: FileRenameDto): Promise<void> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (!(await this.filesRepository.exists(entityManager, fileRenameDto.id))) {
				throw new FileNotFoundException(fileRenameDto.id);
			}

			const parentId = await this.filesRepository.getParentId(entityManager, fileRenameDto.id);

			if (!parentId) {
				throw new ParentDirectoryNotFoundException(fileRenameDto.id);
			}

			if (await this.filesRepository.exists(entityManager, parentId, fileRenameDto.name)) {
				throw new FileAlreadyExistsException(fileRenameDto.name);
			}

			await this.filesRepository.update(entityManager, fileRenameDto.id, { name: fileRenameDto.name });
		});
	}

	public async delete(fileDeleteDto: FileDeleteDto): Promise<void> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (!(await this.filesRepository.exists(entityManager, fileDeleteDto.id))) {
				throw new FileNotFoundException(fileDeleteDto.id);
			}

			await this.filesRepository.delete(entityManager, fileDeleteDto.id);

			const resolvedPath = PathUtils.join(this.configService, StoragePath.Data, PathUtils.uuidToDirPath(fileDeleteDto.id));

			await FileUtils.deleteFile(resolvedPath);
		});
	}
}
