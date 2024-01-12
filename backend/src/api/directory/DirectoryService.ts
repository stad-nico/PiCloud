import * as path from 'path';
import { DataSource } from 'typeorm';

import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DirectoryRepository } from 'src/api/directory/DirectoryRepository';
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

@Injectable()
export class DirectoryService {
	public constructor(
		private readonly dataSource: DataSource,
		private readonly configService: ConfigService,
		@Inject(IDirectoryRepository) private readonly directoryRepository: DirectoryRepository
	) {}

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
			if (!(await this.directoryRepository.exists(entityManager, directoryContentDto.path))) {
				throw new ServerError(`directory at ${directoryContentDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			const content = await this.directoryRepository.getContent(entityManager, directoryContentDto.path);

			return DirectoryContentResponse.from(content);
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
			const metadata = await this.directoryRepository.getMetadata(entityManager, directoryMetadataDto.path);

			if (!metadata) {
				throw new ServerError(`directory at ${directoryMetadataDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			return DirectoryMetadataResponse.from({ path: directoryMetadataDto.path, ...metadata });
		});
	}

	/**
	 * Download a directory as a ZIP-Archive.
	 * @async
	 *
	 * @param {DirectoryDownloadDto} directoryDownloadDto the dto for downloading a directory
	 *
	 * @returns {Promise<DirectoryDownloadResponse>} the response
	 */
	public async download(directoryDownloadDto: DirectoryDownloadDto): Promise<DirectoryDownloadResponse> {
		return this.dataSource.transaction(async (entityManager) => {
			const directory = await this.directoryRepository.selectByPath(entityManager, directoryDownloadDto.path);

			if (!directory) {
				throw new ServerError(`directory at ${directoryDownloadDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			const files = await this.directoryRepository.getFilesRelative(entityManager, directoryDownloadDto.path);

			const archive = await FileUtils.createZIPArchive(this.configService, files);

			return DirectoryDownloadResponse.from(directory.name + '.zip', 'application/zip', archive);
		});
	}

	/**
	 * Restore a soft deleted directory.
	 * @async
	 *
	 * @param {DirectoryRestoreDto} directoryRestoreDto the dto for restoring a directory
	 *
	 * @returns {Promise<DirectoryRestoreResponse>} the response
	 */
	public async restore(directoryRestoreDto: DirectoryRestoreDto): Promise<DirectoryRestoreResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			const directoryToRestore = await this.directoryRepository.selectByUuid(entityManager, directoryRestoreDto.uuid, true);

			if (!directoryToRestore) {
				throw new ServerError(`directory with uuid ${directoryRestoreDto.uuid} does not exist`, HttpStatus.NOT_FOUND);
			}

			if (await this.directoryRepository.exists(entityManager, directoryToRestore.path, false)) {
				throw new ServerError(`directory at ${directoryToRestore.path} already exists`, HttpStatus.CONFLICT);
			}

			await this.directoryRepository.restore(entityManager, directoryRestoreDto.uuid);

			return DirectoryRestoreResponse.from(directoryToRestore.path);
		});
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
			if (await this.directoryRepository.exists(entityManager, directoryCreateDto.path)) {
				throw new ServerError(`directory at ${directoryCreateDto.path} already exists`, HttpStatus.CONFLICT);
			}

			const parentPath = path.dirname(directoryCreateDto.path);
			const hasRootAsParent = path.relative('.', parentPath) === '';

			const parent = await this.directoryRepository.selectByPath(entityManager, parentPath, false);

			if (!parent && !hasRootAsParent) {
				throw new ServerError(`directory at ${parentPath} does not exist`, HttpStatus.NOT_FOUND);
			}

			const parentId = hasRootAsParent ? null : parent!.uuid;

			await this.directoryRepository.insert(entityManager, path.basename(directoryCreateDto.path), parentId);

			return DirectoryCreateResponse.from(directoryCreateDto.path);
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
			if (await this.directoryRepository.exists(entityManager, directoryRenameDto.destPath)) {
				throw new ServerError(`directory at ${directoryRenameDto.destPath} already exists`, HttpStatus.CONFLICT);
			}

			if (!(await this.directoryRepository.exists(entityManager, directoryRenameDto.sourcePath))) {
				throw new ServerError(`directory at ${directoryRenameDto.sourcePath} does not exists`, HttpStatus.NOT_FOUND);
			}

			const destinationName = path.basename(directoryRenameDto.destPath);

			let updateOptions: Partial<Directory> = { name: destinationName };

			if (path.dirname(directoryRenameDto.sourcePath) === path.dirname(directoryRenameDto.destPath)) {
				await this.directoryRepository.update(entityManager, directoryRenameDto.sourcePath, updateOptions);

				return DirectoryRenameResponse.from(directoryRenameDto);
			}

			const destParentPath = path.dirname(directoryRenameDto.destPath);
			const destinationParent = await this.directoryRepository.selectByPath(entityManager, destParentPath);

			if (!destinationParent) {
				throw new ServerError(`directory at ${destParentPath} does not exists`, HttpStatus.NOT_FOUND);
			}

			updateOptions = { ...updateOptions, parent: destinationParent.uuid };

			await this.directoryRepository.update(entityManager, directoryRenameDto.sourcePath, updateOptions);

			return DirectoryRenameResponse.from(directoryRenameDto);
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
			const directory = await this.directoryRepository.selectByPath(entityManager, directoryDeleteDto.path, false);

			if (!directory) {
				throw new ServerError(`directory at ${directoryDeleteDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			await this.directoryRepository.softDelete(entityManager, directory.uuid);

			return DirectoryDeleteResponse.from(directory.uuid);
		});
	}
}
