/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import * as path from 'path';

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
import { DirectoryRenameDto, DirectoryRenameResponse } from 'src/api/directory/mapping/rename';
import { DirectoryAlreadyExistsException } from 'src/exceptions/DirectoryAlreadyExistsException';
import { DirectoryNotFoundException } from 'src/exceptions/DirectoryNotFoundException';
import { ParentDirectoryNotFoundException } from 'src/exceptions/ParentDirectoryNotFoundExceptions';
import { FileUtils } from 'src/util/FileUtils';

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

	/**
	 * Creates a directory by its path.
	 * Throws if a directory at that path already exists or destination parent does not exist.
	 * @async
	 *
	 * @throws  {ParentDirectoryNotFoundException} if parent directory does not exist
	 * @throws  {DirectoryAlreadyExistsException}  if directory already exists
	 *
	 * @param   {DirectoryCreateDto}               directoryCreateDto the dto for creating a new directory
	 * @returns {Promise<DirectoryCreateResponse>}                    the path of the created directory
	 */
	public async create(directoryCreateDto: DirectoryCreateDto): Promise<DirectoryCreateResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (await this.directoryRepository.exists(entityManager, directoryCreateDto.path)) {
				throw new DirectoryAlreadyExistsException(directoryCreateDto.path);
			}

			const parentPath = path.dirname(directoryCreateDto.path);
			const hasRootAsParent = path.relative('.', parentPath) === '';

			const parent = await this.directoryRepository.select(entityManager, parentPath);

			if (!parent && !hasRootAsParent) {
				throw new ParentDirectoryNotFoundException(parentPath);
			}

			const parentId = hasRootAsParent ? 'root' : parent!.id;

			await this.directoryRepository.insert(entityManager, path.basename(directoryCreateDto.path), parentId);

			return DirectoryCreateResponse.from(directoryCreateDto.path);
		});
	}

	/**
	 * Returns the first level subdirectories and files of a directory.
	 * Throws if directory does not exist.
	 * @async
	 *
	 * @throws  {DirectoryNotFoundException} if directory does not exist
	 *
	 * @param   {DirectoryContentDto}               directoryContentDto the dto for getting the contents of a directory
	 * @returns {Promise<DirectoryContentResponse>}                     the contents of the directory
	 */
	public async content(directoryContentDto: DirectoryContentDto): Promise<DirectoryContentResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (!(await this.directoryRepository.exists(entityManager, directoryContentDto.path))) {
				throw new DirectoryNotFoundException(directoryContentDto.path);
			}

			const content = await this.directoryRepository.getContent(entityManager, directoryContentDto.path);

			return DirectoryContentResponse.from(content);
		});
	}

	/**
	 * Returns the metadata of a directory by its path.
	 * Throws if directory at the given path does not exist.
	 * @async
	 *
	 * @throws  {DirectoryNotFoundException} if directory does not exist
	 *
	 * @param   {DirectoryMetadataDto}               directoryMetadataDto the dto for getting the metadata of a directory
	 * @returns {Promise<DirectoryMetadataResponse>}                      the metadata of a directory
	 */
	public async metadata(directoryMetadataDto: DirectoryMetadataDto): Promise<DirectoryMetadataResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			const metadata = await this.directoryRepository.getMetadata(entityManager, directoryMetadataDto.path);

			if (!metadata) {
				throw new DirectoryNotFoundException(directoryMetadataDto.path);
			}

			return DirectoryMetadataResponse.from({ path: directoryMetadataDto.path, ...metadata });
		});
	}

	/**
	 * Returns a stream of a ZIP archive of the contents of a directory as well as mime type and directory name.
	 * Throws if the directory at the given path does not exist.
	 * @async
	 *
	 * @throws  {DirectoryNotFoundException} if directory does not exist
	 *
	 * @param   {DirectoryDownloadDto}               directoryDownloadDto the dto for downloading a directory
	 * @returns {Promise<DirectoryDownloadResponse>}                      the stream, mimeType and directory name
	 */
	public async download(directoryDownloadDto: DirectoryDownloadDto): Promise<DirectoryDownloadResponse> {
		return this.entityManager.transactional(async (entityManager) => {
			const directory = await this.directoryRepository.select(entityManager, directoryDownloadDto.path);

			if (!directory) {
				throw new DirectoryNotFoundException(directoryDownloadDto.path);
			}

			const files = await this.directoryRepository.getFilesRelative(entityManager, directoryDownloadDto.path);

			const readable = await FileUtils.createZIPArchive(this.configService, files);

			return DirectoryDownloadResponse.from(directory.name + '.zip', 'application/zip', readable);
		});
	}

	/**
	 * Renames or moves a directory.
	 * Throws if directory does not exist, destination already exists or destination parent no exists.
	 * @async
	 *
	 * @throws  {DirectoryNotFoundException}       if source directory does not exist
	 * @throws  {DirectoryAlreadyExistsException}  if destination directory already exists
	 * @throws  {ParentDirectoryNotFoundException} if destination parent does not exist
	 *
	 * @param   {DirectoryRenameDto}               directoryRenameDto the dto for renaming a directory
	 * @returns {Promise<DirectoryRenameResponse>}                    the path of the renamed directory
	 */
	public async rename(directoryRenameDto: DirectoryRenameDto): Promise<DirectoryRenameResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (await this.directoryRepository.exists(entityManager, directoryRenameDto.destinationPath)) {
				throw new DirectoryAlreadyExistsException(directoryRenameDto.destinationPath);
			}

			if (!(await this.directoryRepository.exists(entityManager, directoryRenameDto.sourcePath))) {
				throw new DirectoryNotFoundException(directoryRenameDto.sourcePath);
			}

			const willDirectoryNameChange = path.basename(directoryRenameDto.destinationPath) !== path.basename(directoryRenameDto.sourcePath);

			let updateOptions: { name?: string; parentId?: string } = willDirectoryNameChange
				? { name: path.basename(directoryRenameDto.destinationPath) }
				: {};

			if (path.dirname(directoryRenameDto.sourcePath) === path.dirname(directoryRenameDto.destinationPath)) {
				if (willDirectoryNameChange) {
					await this.directoryRepository.update(entityManager, directoryRenameDto.sourcePath, updateOptions);
				}

				return DirectoryRenameResponse.from(directoryRenameDto.destinationPath);
			}

			const destParentPath = path.dirname(directoryRenameDto.destinationPath);
			const hasRootAsParent = path.relative('.', destParentPath) === '';

			const destinationParent = hasRootAsParent ? { id: 'root' } : await this.directoryRepository.select(entityManager, destParentPath);

			if (!destinationParent) {
				throw new ParentDirectoryNotFoundException(destParentPath);
			}

			updateOptions = {
				...updateOptions,
				parentId: destinationParent.id,
			};

			await this.directoryRepository.update(entityManager, directoryRenameDto.sourcePath, updateOptions);

			return DirectoryRenameResponse.from(directoryRenameDto.destinationPath);
		});
	}

	/**
	 * Deletes a directory by its path.
	 * Throws if directory at given path does not exist.
	 * @async
	 *
	 * @throws {DirectoryNotFoundException} if directory does not exist
	 *
	 * @param {DirectoryDeleteDto} directoryDeleteDto the dto for deleting the directory
	 */
	public async delete(directoryDeleteDto: DirectoryDeleteDto): Promise<void> {
		return await this.entityManager.transactional(async (entityManager) => {
			const directory = await this.directoryRepository.select(entityManager, directoryDeleteDto.path);

			if (!directory) {
				throw new DirectoryNotFoundException(directoryDeleteDto.path);
			}

			await this.directoryRepository.delete(entityManager, directory.id);
		});
	}
}
