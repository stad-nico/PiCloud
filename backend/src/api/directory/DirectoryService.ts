import * as path from 'path';

import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EntityManager } from '@mikro-orm/mariadb';
import { IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';
import { DirectoryContentDto, DirectoryContentResponse } from 'src/api/directory/mapping/content';
import { DirectoryCreateDto, DirectoryCreateResponse } from 'src/api/directory/mapping/create';
import { DirectoryDeleteDto, DirectoryDeleteResponse } from 'src/api/directory/mapping/delete';
import { DirectoryDownloadDto, DirectoryDownloadResponse } from 'src/api/directory/mapping/download';
import { DirectoryMetadataDto, DirectoryMetadataResponse } from 'src/api/directory/mapping/metadata';
import { DirectoryRenameDto, DirectoryRenameResponse } from 'src/api/directory/mapping/rename';
import { DirectoryRestoreDto, DirectoryRestoreResponse } from 'src/api/directory/mapping/restore';
import { Directory } from 'src/db/entities/Directory';
import { FileUtils } from 'src/util/FileUtils';
import { ServerError } from 'src/util/ServerError';

/**
 * Service for CRUD operations on directory entities.
 * @class
 */
@Injectable()
export class DirectoryService {
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
	public constructor(
		entityManager: EntityManager,
		configService: ConfigService,
		@Inject(IDirectoryRepository) directoryRepository: IDirectoryRepository
	) {
		this.entityManager = entityManager;
		this.configService = configService;
		this.directoryRepository = directoryRepository;
	}

	/**
	 * Returns the first level subdirectories and files of a directory.
	 * Throws if directory does not exist.
	 * @async
	 *
	 * @throws  {ServerError} directory must exist
	 *
	 * @param   {DirectoryContentDto}               directoryContentDto the dto for getting the contents of a directory
	 * @returns {Promise<DirectoryContentResponse>}                     the contents of the directory
	 */
	public async content(directoryContentDto: DirectoryContentDto): Promise<DirectoryContentResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (!(await this.directoryRepository.exists(entityManager, directoryContentDto.path, false))) {
				throw new ServerError(`directory ${directoryContentDto.path} does not exist`, HttpStatus.NOT_FOUND);
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
	 * @throws  {ServerError} directory must exist
	 *
	 * @param   {DirectoryMetadataDto}               directoryMetadataDto the dto for getting the metadata of a directory
	 * @returns {Promise<DirectoryMetadataResponse>}                      the metadata of a directory
	 */
	public async metadata(directoryMetadataDto: DirectoryMetadataDto): Promise<DirectoryMetadataResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			const metadata = await this.directoryRepository.getMetadata(entityManager, directoryMetadataDto.path);

			if (!metadata) {
				throw new ServerError(`directory ${directoryMetadataDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			return DirectoryMetadataResponse.from({ path: directoryMetadataDto.path, ...metadata });
		});
	}

	/**
	 * Returns a stream of a ZIP-archive of the contents of a directory as well as mimeType and directory name.
	 * Throws if the directory at the given path does not exist.
	 * @async
	 *
	 * @throws  {ServerError} directory must exist
	 *
	 * @param   {DirectoryDownloadDto}               directoryDownloadDto the dto for downloading a directory
	 * @returns {Promise<DirectoryDownloadResponse>}                      the stream, mimeType and directory name
	 */
	public async download(directoryDownloadDto: DirectoryDownloadDto): Promise<DirectoryDownloadResponse> {
		return this.entityManager.transactional(async (entityManager) => {
			const directory = await this.directoryRepository.selectByPath(entityManager, directoryDownloadDto.path, false);

			if (!directory) {
				throw new ServerError(`directory ${directoryDownloadDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			const files = await this.directoryRepository.getFilesRelative(entityManager, directoryDownloadDto.path);

			const readable = await FileUtils.createZIPArchive(this.configService, files);

			return DirectoryDownloadResponse.from(directory.name + '.zip', 'application/zip', readable);
		});
	}

	/**
	 * Restores a soft deleted directory by its id.
	 * Throws if no directory with the given id exists or destination path already exists.
	 * @async
	 *
	 * @throws  {ServerError} directory must exist
	 * @throws  {ServerError} destination must not already exist
	 *
	 * @param   {DirectoryRestoreDto}               directoryRestoreDto the dto for restoring a directory
	 * @returns {Promise<DirectoryRestoreResponse>}                     the path of the restored directory
	 */
	public async restore(directoryRestoreDto: DirectoryRestoreDto): Promise<DirectoryRestoreResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			const directoryToRestore = await this.directoryRepository.selectByUuid(entityManager, directoryRestoreDto.uuid, true);

			if (!directoryToRestore) {
				throw new ServerError(`directory with uuid ${directoryRestoreDto.uuid} does not exist`, HttpStatus.NOT_FOUND);
			}

			if (await this.directoryRepository.exists(entityManager, directoryToRestore.path, false)) {
				throw new ServerError(`directory ${directoryToRestore.path} already exists`, HttpStatus.CONFLICT);
			}

			await this.directoryRepository.restore(entityManager, directoryRestoreDto.uuid);

			return DirectoryRestoreResponse.from(directoryToRestore.path);
		});
	}

	/**
	 * Creates a directory by its path.
	 * Throws if a directory at that path already exists or destination parent does not exist.
	 * @async
	 *
	 * @throws  {ServerError} destination parent must exist
	 * @throws  {ServerError} destination must not already exist
	 *
	 * @param   {DirectoryCreateDto}               directoryCreateDto the dto for creating a new directory
	 * @returns {Promise<DirectoryCreateResponse>}                    the path of the created directory
	 */
	public async create(directoryCreateDto: DirectoryCreateDto): Promise<DirectoryCreateResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (await this.directoryRepository.exists(entityManager, directoryCreateDto.path, false)) {
				throw new ServerError(`directory ${directoryCreateDto.path} already exists`, HttpStatus.CONFLICT);
			}

			const parentPath = path.dirname(directoryCreateDto.path);
			const hasRootAsParent = path.relative('.', parentPath) === '';

			const parent = await this.directoryRepository.selectByPath(entityManager, parentPath, false);

			if (!parent && !hasRootAsParent) {
				throw new ServerError(`directory ${parentPath} does not exist`, HttpStatus.NOT_FOUND);
			}

			const parentId = hasRootAsParent ? null : parent!.id;

			await this.directoryRepository.insert(entityManager, path.basename(directoryCreateDto.path), parentId);

			return DirectoryCreateResponse.from(directoryCreateDto.path);
		});
	}

	/**
	 * Renames or moves a directory.
	 * Throws if directory does not exist, destination already exists or destination parent no exists.
	 * @async
	 *
	 * @throws  {ServerError} directory must exist
	 * @throws  {ServerError} destination must not already exist
	 * @throws  {ServerError} destination parent must exist
	 *
	 * @param   {DirectoryRenameDto}               directoryRenameDto the dto for renaming a directory
	 * @returns {Promise<DirectoryRenameResponse>}                    the path of the renamed directory
	 */
	public async rename(directoryRenameDto: DirectoryRenameDto): Promise<DirectoryRenameResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (await this.directoryRepository.exists(entityManager, directoryRenameDto.destPath, false)) {
				throw new ServerError(`directory ${directoryRenameDto.destPath} already exists`, HttpStatus.CONFLICT);
			}

			if (!(await this.directoryRepository.exists(entityManager, directoryRenameDto.sourcePath, false))) {
				throw new ServerError(`directory ${directoryRenameDto.sourcePath} does not exists`, HttpStatus.NOT_FOUND);
			}

			const destinationName = path.basename(directoryRenameDto.destPath);

			let updateOptions: Partial<Directory> = { name: destinationName };

			if (path.dirname(directoryRenameDto.sourcePath) === path.dirname(directoryRenameDto.destPath)) {
				await this.directoryRepository.update(entityManager, directoryRenameDto.sourcePath, updateOptions);

				return DirectoryRenameResponse.from(directoryRenameDto);
			}

			const destParentPath = path.dirname(directoryRenameDto.destPath);
			const destinationParent = await this.directoryRepository.selectByPath(entityManager, destParentPath, false);

			if (!destinationParent) {
				throw new ServerError(`directory ${destParentPath} does not exists`, HttpStatus.NOT_FOUND);
			}

			updateOptions = { ...updateOptions, parent: entityManager.getReference(Directory, destinationParent.id) };

			await this.directoryRepository.update(entityManager, directoryRenameDto.sourcePath, updateOptions);

			return DirectoryRenameResponse.from(directoryRenameDto);
		});
	}

	/**
	 * Soft deletes a directory by its path.
	 * Throws if directory at given path does not exist.
	 * @async
	 *
	 * @throws  {ServerError} directory must exist
	 *
	 * @param   {DirectoryDeleteDto}               directoryDeleteDto the dto for soft deleting a directory
	 * @returns {Promise<DirectoryDeleteResponse>}                    the id of the deleted directory
	 */
	public async delete(directoryDeleteDto: DirectoryDeleteDto): Promise<DirectoryDeleteResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			const directory = await this.directoryRepository.selectByPath(entityManager, directoryDeleteDto.path, false);

			if (!directory) {
				throw new ServerError(`directory ${directoryDeleteDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			await this.directoryRepository.softDelete(entityManager, directory.id);

			return DirectoryDeleteResponse.from(directory.id);
		});
	}
}
