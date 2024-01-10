import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { DirectoryRepository, IDirectoryRepository } from 'src/api/directory/directory.repository';
import { DirectoryContentResponse } from 'src/api/directory/mapping/content/directory.content.response';
import { DirectoryCreateDto } from 'src/api/directory/mapping/create/directory.create.dto';
import { DirectoryCreateResponse } from 'src/api/directory/mapping/create/directory.create.response';
import { DirectoryDeleteDto } from 'src/api/directory/mapping/delete/directory.delete.dto';
import { DirectoryDeleteResponse } from 'src/api/directory/mapping/delete/directory.delete.response';
import { DirectoryDownloadDto } from 'src/api/directory/mapping/download/directory.download.dto';
import { DirectoryDownloadResponse } from 'src/api/directory/mapping/download/directory.download.response';
import { DirectoryMetadataDto } from 'src/api/directory/mapping/metadata/directory.metadata.dto';
import { DirectoryMetadataResponse } from 'src/api/directory/mapping/metadata/directory.metadata.response';
import { DirectoryRenameDto } from 'src/api/directory/mapping/rename/directory.rename.dto';
import { DirectoryRenameResponse } from 'src/api/directory/mapping/rename/directory.rename.response';
import { DirectoryRestoreDto } from 'src/api/directory/mapping/restore/directory.restore.dto';
import { DirectoryRestoreResponse } from 'src/api/directory/mapping/restore/directory.restore.response';
import { Directory } from 'src/db/entities/Directory';
import { FileUtils } from 'src/util/FileUtils';
import { ServerError } from 'src/util/ServerError';
import { DataSource } from 'typeorm';
import { DirectoryContentDto } from './mapping/content/directory.content.dto';

@Injectable()
export class DirectoryService {
	private readonly dataSource: DataSource;

	private readonly repository: IDirectoryRepository;

	private readonly configService: ConfigService;

	public constructor(
		@Inject(IDirectoryRepository) repository: DirectoryRepository,
		dataSource: DataSource,
		configService: ConfigService
	) {
		this.dataSource = dataSource;
		this.repository = repository;
		this.configService = configService;
	}

	/**
	 * Create a directory or fail if it already exists or destination parent does not exist.
	 * @async
	 *
	 * @param {DirectoryCreateDto} directoryCreateDto the dto for creating a new directory
	 *
	 * @returns {Promise<DirectoryCreateResponse>} the response
	 */
	public async create(directoryCreateDto: DirectoryCreateDto): Promise<DirectoryCreateResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			if (await this.repository.exists(entityManager, directoryCreateDto.path)) {
				throw new ServerError(`directory at ${directoryCreateDto.path} already exists`, HttpStatus.CONFLICT);
			}

			const parentPath = path.dirname(directoryCreateDto.path);
			const hasRootAsParent = path.relative('.', parentPath) === '';

			const parent = await this.repository.selectByPath(entityManager, parentPath, false);

			if (!parent && !hasRootAsParent) {
				throw new ServerError(`directory at ${parentPath} does not exist`, HttpStatus.NOT_FOUND);
			}

			const parentId = hasRootAsParent ? null : parent!.uuid;

			await this.repository.insert(entityManager, path.basename(directoryCreateDto.path), parentId);

			return DirectoryCreateResponse.from(directoryCreateDto.path);
		});
	}

	/**
	 * Soft delete a directory or fail if it does not exist.
	 * @async
	 *
	 * @param {DirectoryDeleteDto} directoryDeleteDto the dto for soft deleting a directory
	 *
	 * @returns {Promise<DirectoryDeleteResponse>} the response
	 */
	public async delete(directoryDeleteDto: DirectoryDeleteDto): Promise<DirectoryDeleteResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			const directory = await this.repository.selectByPath(entityManager, directoryDeleteDto.path, false);

			if (!directory) {
				throw new ServerError(`directory at ${directoryDeleteDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			await this.repository.softDelete(entityManager, directory.uuid);

			return DirectoryDeleteResponse.from(directory.uuid);
		});
	}

	/**
	 * Get the metadata of a directory.
	 * @async
	 *
	 * @param {DirectoryMetadataDto} directoryMetadataDto the dto for getting the metadata of a directory
	 *
	 * @returns {Promise<DirectoryMetadataResponse>} the response
	 */
	public async metadata(directoryMetadataDto: DirectoryMetadataDto): Promise<DirectoryMetadataResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			const metadata = await this.repository.getMetadata(entityManager, directoryMetadataDto.path);

			if (!metadata) {
				throw new ServerError(`directory at ${directoryMetadataDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			return DirectoryMetadataResponse.from({ path: directoryMetadataDto.path, ...metadata });
		});
	}

	/**
	 * Get the first level subdirectories and files of a directory.
	 * @async
	 *
	 * @param {DirectoryContentDto} directoryContentDto the dto for getting the contents of a directory
	 *
	 * @returns {Promise<DirectoryContentResponse>} the response
	 */
	public async content(directoryContentDto: DirectoryContentDto): Promise<DirectoryContentResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			if (!(await this.repository.exists(entityManager, directoryContentDto.path))) {
				throw new ServerError(`directory at ${directoryContentDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			const content = await this.repository.getContent(entityManager, directoryContentDto.path);

			return DirectoryContentResponse.from(content);
		});
	}

	/**
	 * Download a directory.
	 * @async
	 *
	 * @param {DirectoryDownloadDto} directoryDownloadDto the dto for downloading a directory
	 *
	 * @returns {Promise<DirectoryDownloadResponse>} the response
	 */
	public async download(directoryDownloadDto: DirectoryDownloadDto): Promise<DirectoryDownloadResponse> {
		return this.dataSource.transaction(async (entityManager) => {
			const directory = await this.repository.selectByPath(entityManager, directoryDownloadDto.path);

			if (!directory) {
				throw new ServerError(`directory at ${directoryDownloadDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			const files = await this.repository.getFilesRelative(entityManager, directoryDownloadDto.path);

			const archive = await FileUtils.createZIPArchive(this.configService, files);

			return DirectoryDownloadResponse.from(directory.name + '.zip', 'application/zip', archive);
		});
	}

	/**
	 * Rename or move a directory.
	 * @async
	 *
	 * @param {DirectoryRenameDto} directoryRenameDto the dto for renaming a directory
	 *
	 * @returns {Promise<DirectoryRenameResponse>} the response
	 */
	public async rename(directoryRenameDto: DirectoryRenameDto): Promise<DirectoryRenameResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			if (await this.repository.exists(entityManager, directoryRenameDto.destPath)) {
				throw new ServerError(`directory at ${directoryRenameDto.destPath} already exists`, HttpStatus.CONFLICT);
			}

			if (!(await this.repository.exists(entityManager, directoryRenameDto.sourcePath))) {
				throw new ServerError(`directory at ${directoryRenameDto.sourcePath} does not exists`, HttpStatus.NOT_FOUND);
			}

			const destParentPath = path.dirname(directoryRenameDto.destPath);

			const destinationParent = await this.repository.selectByPath(entityManager, destParentPath);

			if (!destinationParent) {
				throw new ServerError(`directory at ${destParentPath} does not exists`, HttpStatus.NOT_FOUND);
			}

			const destinationName = path.basename(directoryRenameDto.destPath);

			let updateOptions: Partial<Directory> = { name: destinationName };

			if (path.dirname(directoryRenameDto.sourcePath) !== path.dirname(directoryRenameDto.destPath)) {
				updateOptions = { ...updateOptions, parent: destinationParent.uuid };
			}

			await this.repository.update(entityManager, directoryRenameDto.sourcePath, updateOptions);

			return DirectoryRenameResponse.from(directoryRenameDto);
		});
	}

	/**
	 * Restore a deleted directory.
	 * @async
	 *
	 * @param {DirectoryRestoreDto} directoryRestoreDto the dto for restoring a directory
	 *
	 * @returns {Promise<DirectoryRestoreResponse>} the response
	 */
	public async restore(directoryRestoreDto: DirectoryRestoreDto): Promise<DirectoryRestoreResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			const directoryToRestore = await this.repository.selectByUuid(entityManager, directoryRestoreDto.uuid, true);

			if (!directoryToRestore) {
				throw new ServerError(`directory with uuid ${directoryRestoreDto.uuid} does not exist`, HttpStatus.NOT_FOUND);
			}

			if (await this.repository.exists(entityManager, directoryToRestore.path, false)) {
				throw new ServerError(`directory at ${directoryToRestore.path} already exists`, HttpStatus.CONFLICT);
			}

			await this.repository.restore(entityManager, directoryRestoreDto.uuid);

			return DirectoryRestoreResponse.from(directoryToRestore.path);
		});
	}
}
