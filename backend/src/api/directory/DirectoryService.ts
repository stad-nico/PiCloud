/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/

import { EntityManager } from '@mikro-orm/mariadb';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';
import { IDirectoryService } from 'src/api/directory/IDirectoryService';
import { DirectoryContentDto, DirectoryContentResponse } from 'src/api/directory/mapping/content';
import { DirectoryCreateDto, DirectoryCreateResponse } from 'src/api/directory/mapping/create';
import { DirectoryDeleteDto } from 'src/api/directory/mapping/delete';
import { DirectoryDownloadDto, DirectoryDownloadResponse } from 'src/api/directory/mapping/download';
import { DirectoryMetadataDto, DirectoryMetadataResponse } from 'src/api/directory/mapping/metadata';
import { DirectoryRenameDto } from 'src/api/directory/mapping/rename';
import { ROOT_ID } from 'src/db/entities/Directory';
import { DirectoryAlreadyExistsException } from 'src/exceptions/DirectoryAlreadyExistsException';
import { DirectoryNotFoundException } from 'src/exceptions/DirectoryNotFoundException';
import { ParentDirectoryNotFoundException } from 'src/exceptions/ParentDirectoryNotFoundExceptions';
import { RootCannotBeDeletedException } from 'src/exceptions/RootCannotBeDeletedException';
import { RootCannotBeRenamedException } from 'src/exceptions/RootCannotBeRenamed';
import { FileUtils } from 'src/util/FileUtils';
import { PathUtils } from 'src/util/PathUtils';

/**
 * Service for CRUD operations on directory entities.
 * @class
 */
@Injectable()
export class DirectoryService implements IDirectoryService {
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
	 * @type {IDirectoryRepository}
	 */
	private readonly directoryRepository: IDirectoryRepository;

	/**
	 * Creates a new DirectoryService instance.
	 * @constructor
	 *
	 * @param   {EntityManager}        entityManager       the entityManager
	 * @param   {ConfigService}        configService       the configService
	 * @param   {IDirectoryRepository} directoryRepository the directoryRepository
	 * @returns {DirectoryService}                         the DirectoryService instance
	 */
	public constructor(entityManager: EntityManager, configService: ConfigService, @Inject(IDirectoryRepository) directoryRepository: IDirectoryRepository) {
		this.entityManager = entityManager;
		this.configService = configService;
		this.directoryRepository = directoryRepository;
	}

	public async create(directoryCreateDto: DirectoryCreateDto): Promise<DirectoryCreateResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (await this.directoryRepository.exists(entityManager, directoryCreateDto.id, directoryCreateDto.name)) {
				throw new DirectoryAlreadyExistsException(directoryCreateDto.name);
			}

			if (!(await this.directoryRepository.exists(entityManager, directoryCreateDto.id))) {
				throw new DirectoryNotFoundException(directoryCreateDto.id);
			}

			const id = await this.directoryRepository.insertReturningId(entityManager, directoryCreateDto.id, directoryCreateDto.name);

			return DirectoryCreateResponse.from(id);
		});
	}

	public async contents(directoryContentDto: DirectoryContentDto): Promise<DirectoryContentResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (!(await this.directoryRepository.exists(entityManager, directoryContentDto.id))) {
				throw new DirectoryNotFoundException(directoryContentDto.id);
			}

			const content = await this.directoryRepository.getContents(entityManager, directoryContentDto.id);

			return DirectoryContentResponse.from(content);
		});
	}

	public async metadata(directoryMetadataDto: DirectoryMetadataDto): Promise<DirectoryMetadataResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			const metadata = await this.directoryRepository.getMetadata(entityManager, directoryMetadataDto.id);

			if (!metadata) {
				throw new DirectoryNotFoundException(directoryMetadataDto.id);
			}

			return DirectoryMetadataResponse.from(metadata);
		});
	}

	public async download(directoryDownloadDto: DirectoryDownloadDto): Promise<DirectoryDownloadResponse> {
		return this.entityManager.transactional(async (entityManager) => {
			const name = await this.directoryRepository.getName(entityManager, directoryDownloadDto.id);

			if (!name) {
				throw new DirectoryNotFoundException(directoryDownloadDto.id);
			}

			const { files, directories } = await this.directoryRepository.getContentsRecursive(entityManager, directoryDownloadDto.id);

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

			const parentId = await this.directoryRepository.getParentId(entityManager, directoryRenameDto.id);

			if (!parentId) {
				throw new ParentDirectoryNotFoundException(directoryRenameDto.id);
			}

			if (await this.directoryRepository.exists(entityManager, parentId, directoryRenameDto.name)) {
				throw new DirectoryAlreadyExistsException(directoryRenameDto.name);
			}

			if (!(await this.directoryRepository.exists(entityManager, directoryRenameDto.id))) {
				throw new DirectoryNotFoundException(directoryRenameDto.id);
			}

			await this.directoryRepository.update(entityManager, directoryRenameDto.id, { name: directoryRenameDto.name });
		});
	}

	public async delete(directoryDeleteDto: DirectoryDeleteDto): Promise<void> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (directoryDeleteDto.id === ROOT_ID) {
				throw new RootCannotBeDeletedException();
			}

			if (!(await this.directoryRepository.exists(entityManager, directoryDeleteDto.id))) {
				throw new DirectoryNotFoundException(directoryDeleteDto.id);
			}

			await this.directoryRepository.delete(entityManager, directoryDeleteDto.id);
		});
	}
}
