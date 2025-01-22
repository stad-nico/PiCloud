/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/

import { EntityManager } from '@mikro-orm/mariadb';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ROOT_ID } from 'src/db/entities/directory.entity';
import { IDirectoriesRepository } from 'src/modules/directories/IDirectoriesRepository';
import { IDirectoriesService } from 'src/modules/directories/IDirectoriesService';
import { DirectoryContentDto, DirectoryContentResponse } from 'src/modules/directories/mapping/content';
import { DirectoryCreateDto, DirectoryCreateResponse } from 'src/modules/directories/mapping/create';
import { DirectoryDeleteDto } from 'src/modules/directories/mapping/delete';
import { DirectoryDownloadDto, DirectoryDownloadResponse } from 'src/modules/directories/mapping/download';
import { DirectoryMetadataDto, DirectoryMetadataResponse } from 'src/modules/directories/mapping/metadata';
import { DirectoryRenameDto } from 'src/modules/directories/mapping/rename';
import { StoragePath } from 'src/modules/disk/DiskService';
import { DirectoryAlreadyExistsException } from 'src/shared/exceptions/DirectoryAlreadyExistsException';
import { DirectoryNotFoundException } from 'src/shared/exceptions/DirectoryNotFoundException';
import { ParentDirectoryNotFoundException } from 'src/shared/exceptions/ParentDirectoryNotFoundExceptions';
import { RootCannotBeDeletedException } from 'src/shared/exceptions/RootCannotBeDeletedException';
import { RootCannotBeRenamedException } from 'src/shared/exceptions/RootCannotBeRenamed';
import { FileUtils } from 'src/util/FileUtils';
import { PathUtils } from 'src/util/PathUtils';

/**
 * Service for CRUD operations on directory entities.
 * @class
 */
@Injectable()
export class DirectoriesService implements IDirectoriesService {
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
	 * The repository for executing directory operations on the db.
	 * @type {IDirectoriesRepository}
	 */
	private readonly directoriesRepository: IDirectoriesRepository;

	/**
	 * Creates a new DirectoryService instance.
	 * @constructor
	 *
	 * @param   {EntityManager}          entityManager         the entityManager
	 * @param   {ConfigService}          configService         the configService
	 * @param   {IDirectoriesRepository} directoriesRepository the directoriesRepository
	 * @returns {DirectoryService}                             the DirectoryService instance
	 */
	public constructor(
		entityManager: EntityManager,
		configService: ConfigService,
		@Inject(IDirectoriesRepository) directoriesRepository: IDirectoriesRepository
	) {
		this.entityManager = entityManager;
		this.configService = configService;
		this.directoriesRepository = directoriesRepository;
	}

	public async create(directoryCreateDto: DirectoryCreateDto): Promise<DirectoryCreateResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (await this.directoriesRepository.exists(entityManager, directoryCreateDto.id, directoryCreateDto.name)) {
				throw new DirectoryAlreadyExistsException(directoryCreateDto.name);
			}

			if (!(await this.directoriesRepository.exists(entityManager, directoryCreateDto.id))) {
				throw new DirectoryNotFoundException(directoryCreateDto.id);
			}

			const id = await this.directoriesRepository.insertReturningId(entityManager, directoryCreateDto.id, directoryCreateDto.name);

			return DirectoryCreateResponse.from(id);
		});
	}

	public async contents(directoryContentDto: DirectoryContentDto): Promise<DirectoryContentResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (!(await this.directoriesRepository.exists(entityManager, directoryContentDto.id))) {
				throw new DirectoryNotFoundException(directoryContentDto.id);
			}

			const content = await this.directoriesRepository.getContents(entityManager, directoryContentDto.id);

			return DirectoryContentResponse.from(content);
		});
	}

	public async metadata(directoryMetadataDto: DirectoryMetadataDto): Promise<DirectoryMetadataResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			const metadata = await this.directoriesRepository.getMetadata(entityManager, directoryMetadataDto.id);

			if (!metadata) {
				throw new DirectoryNotFoundException(directoryMetadataDto.id);
			}

			return DirectoryMetadataResponse.from(metadata);
		});
	}

	public async download(directoryDownloadDto: DirectoryDownloadDto): Promise<DirectoryDownloadResponse> {
		return this.entityManager.transactional(async (entityManager) => {
			const name = await this.directoriesRepository.getName(entityManager, directoryDownloadDto.id);

			if (!name) {
				throw new DirectoryNotFoundException(directoryDownloadDto.id);
			}

			const { files, directories } = await this.directoriesRepository.getContentsRecursive(entityManager, directoryDownloadDto.id);

			const relativePathFiles = PathUtils.buildFilePaths(directoryDownloadDto.id, files, directories);

			const readable = await FileUtils.createZIPArchive(this.configService, relativePathFiles);

			return DirectoryDownloadResponse.from(name + '.zip', 'application/zip', readable);
		});
	}

	public async rename(directoryRenameDto: DirectoryRenameDto): Promise<void> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (directoryRenameDto.id === ROOT_ID) {
				throw new RootCannotBeRenamedException();
			}

			const parentId = await this.directoriesRepository.getParentId(entityManager, directoryRenameDto.id);

			if (!parentId) {
				throw new ParentDirectoryNotFoundException(directoryRenameDto.id);
			}

			if (await this.directoriesRepository.exists(entityManager, parentId, directoryRenameDto.name)) {
				throw new DirectoryAlreadyExistsException(directoryRenameDto.name);
			}

			if (!(await this.directoriesRepository.exists(entityManager, directoryRenameDto.id))) {
				throw new DirectoryNotFoundException(directoryRenameDto.id);
			}

			await this.directoriesRepository.update(entityManager, directoryRenameDto.id, { name: directoryRenameDto.name });
		});
	}

	public async delete(directoryDeleteDto: DirectoryDeleteDto): Promise<void> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (directoryDeleteDto.id === ROOT_ID) {
				throw new RootCannotBeDeletedException();
			}

			if (!(await this.directoriesRepository.exists(entityManager, directoryDeleteDto.id))) {
				throw new DirectoryNotFoundException(directoryDeleteDto.id);
			}

			const { files } = await this.directoriesRepository.getContentsRecursive(entityManager, directoryDeleteDto.id);

			await this.directoriesRepository.delete(entityManager, directoryDeleteDto.id);

			for (const file of files) {
				const filepath = PathUtils.join(this.configService, StoragePath.Data, PathUtils.uuidToDirPath(file.id));

				await FileUtils.deleteFile(filepath);
			}
		});
	}
}
