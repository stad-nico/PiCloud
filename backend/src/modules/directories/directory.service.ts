/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Transactional } from '@mikro-orm/mariadb';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DirectoryRepository } from 'src/modules/directories/directory.repository';
import { DirectoryAlreadyExistsException } from 'src/modules/directories/exceptions/directory-already-exists.exception';
import { DirectoryNotFoundException } from 'src/modules/directories/exceptions/directory-not-found.exception';
import { RootCannotBeDeletedException } from 'src/modules/directories/exceptions/root-cannot-be-deleted.exception';
import { RootCannotBeRenamedException } from 'src/modules/directories/exceptions/root-cannot-be-renamed.exception';
import { GetDirectoryContentsDto } from 'src/modules/directories/mapping/contents/get-directory-contents.dto';
import { GetDirectoryContentsResponse } from 'src/modules/directories/mapping/contents/get-directory-contents.response';
import { CreateDirectoryDto } from 'src/modules/directories/mapping/create/create-directory.dto';
import { CreateDirectoryResponse } from 'src/modules/directories/mapping/create/create-directory.response';
import { DeleteDirectoryDto } from 'src/modules/directories/mapping/delete/delete-directory.dto';
import { DownloadDirectoryDto } from 'src/modules/directories/mapping/download/download-directory.dto';
import { DownloadDirectoryResponse } from 'src/modules/directories/mapping/download/download-directory.response';
import { GetDirectoryMetadataDto } from 'src/modules/directories/mapping/metadata/get-directory-metadata.dto';
import { GetDirectoryMetadataResponse } from 'src/modules/directories/mapping/metadata/get-directory-metadata.response';
import { RenameDirectoryDto } from 'src/modules/directories/mapping/rename/rename-directory.dto';
import { StoragePath } from 'src/modules/disk/DiskService';
import { FileRepository } from 'src/modules/files/file.repository';
import { FileUtils } from 'src/util/FileUtils';
import { PathUtils } from 'src/util/PathUtils';

@Injectable()
export class DirectoryService {
	public constructor(
		private readonly configService: ConfigService,
		private readonly directoryRepository: DirectoryRepository,
		private readonly fileRepository: FileRepository
	) {}

	@Transactional()
	public async getRoot(userId: string): Promise<{ id: string }> {
		let rootDirectory = await this.directoryRepository.findOne({ parent: null, user: userId });

		if (!rootDirectory) {
			rootDirectory = this.directoryRepository.create({ parent: null, name: 'root', user: userId });
		}

		return { id: rootDirectory.id };
	}

	@Transactional()
	public async create(createDirectoryDto: CreateDirectoryDto): Promise<CreateDirectoryResponse> {
		const parentDirectory = await this.directoryRepository.findOne({ id: createDirectoryDto.parentId });

		if (parentDirectory?.user.id !== createDirectoryDto.userId) {
			throw new DirectoryNotFoundException(createDirectoryDto.parentId);
		}

		const existingDirectory = await this.directoryRepository.findOne({
			parent: createDirectoryDto.parentId,
			name: createDirectoryDto.name,
			user: createDirectoryDto.userId,
		});

		if (existingDirectory) {
			throw new DirectoryAlreadyExistsException(createDirectoryDto.name);
		}

		const directory = this.directoryRepository.create({
			parent: createDirectoryDto.parentId,
			name: createDirectoryDto.name,
			user: createDirectoryDto.userId,
		});

		await this.directoryRepository.nativeUpdate({ id: parentDirectory.id }, { updatedAt: new Date() });

		return CreateDirectoryResponse.from(directory.id);
	}

	@Transactional()
	public async contents(getDirectoryContentsDto: GetDirectoryContentsDto): Promise<GetDirectoryContentsResponse> {
		const directory = await this.directoryRepository.findOne({ id: getDirectoryContentsDto.directoryId });

		if (directory?.user.id !== getDirectoryContentsDto.userId) {
			throw new DirectoryNotFoundException(getDirectoryContentsDto.directoryId);
		}

		const files = await this.fileRepository.findAll({ where: { parent: directory.id, user: directory.user } });
		const directories = await this.directoryRepository.getContents(directory);

		return GetDirectoryContentsResponse.from(files, directories);
	}

	@Transactional()
	public async metadata(getDirectoryMetadataDto: GetDirectoryMetadataDto): Promise<GetDirectoryMetadataResponse> {
		const directory = await this.directoryRepository.findOne({ id: getDirectoryMetadataDto.directoryId });

		if (directory?.user.id !== getDirectoryMetadataDto.userId) {
			throw new DirectoryNotFoundException(getDirectoryMetadataDto.directoryId);
		}

		const metadata = await this.directoryRepository.getMetadata(directory);

		return GetDirectoryMetadataResponse.from(metadata);
	}

	@Transactional()
	public async download(downloadDirectoryDto: DownloadDirectoryDto): Promise<DownloadDirectoryResponse> {
		const directory = await this.directoryRepository.findOne({ id: downloadDirectoryDto.directoryId });

		if (directory?.user.id !== downloadDirectoryDto.userId) {
			throw new DirectoryNotFoundException(downloadDirectoryDto.directoryId);
		}

		const { files, directories } = await this.directoryRepository.getContentsRecursive(directory);

		const relativeFilePaths = PathUtils.buildFilePaths(directory.id, files, directories);

		const readable = FileUtils.createZIPArchive(this.configService, relativeFilePaths);

		return DownloadDirectoryResponse.from(directory.name + '.zip', 'application/zip', readable);
	}

	@Transactional()
	public async rename(renameDirectoryDto: RenameDirectoryDto): Promise<void> {
		const directory = await this.directoryRepository.findOne({ id: renameDirectoryDto.directoryId });

		if (directory?.user.id !== renameDirectoryDto.userId) {
			throw new DirectoryNotFoundException(renameDirectoryDto.directoryId);
		}

		const root = await this.getRoot(renameDirectoryDto.userId);

		if (directory.id === root.id || !directory.parent) {
			throw new RootCannotBeRenamedException();
		}

		const existingDirectory = await this.directoryRepository.findOne({
			parent: directory.parent,
			name: renameDirectoryDto.name,
			user: renameDirectoryDto.userId,
		});

		if (existingDirectory) {
			throw new DirectoryAlreadyExistsException(renameDirectoryDto.name);
		}

		await this.directoryRepository.nativeUpdate({ id: directory.id }, { name: renameDirectoryDto.name });

		await this.directoryRepository.nativeUpdate({ id: directory.parent.id }, { updatedAt: new Date() });
	}

	@Transactional()
	public async delete(deleteDirectoryDto: DeleteDirectoryDto): Promise<void> {
		const directory = await this.directoryRepository.findOne({ id: deleteDirectoryDto.directoryId });

		if (directory?.user.id !== deleteDirectoryDto.userId) {
			throw new DirectoryNotFoundException(deleteDirectoryDto.directoryId);
		}

		const root = await this.getRoot(deleteDirectoryDto.userId);

		if (directory.id === root.id || !directory.parent) {
			throw new RootCannotBeDeletedException();
		}

		await this.directoryRepository.nativeDelete({ id: deleteDirectoryDto.directoryId });

		await this.directoryRepository.nativeUpdate({ id: directory.parent.id }, { updatedAt: new Date() });

		const { files } = await this.directoryRepository.getContentsRecursive(directory);

		for (const file of files) {
			const filepath = PathUtils.join(this.configService, StoragePath.Data, PathUtils.uuidToDirPath(file.id));

			await FileUtils.deleteFile(filepath);
		}
	}
}
