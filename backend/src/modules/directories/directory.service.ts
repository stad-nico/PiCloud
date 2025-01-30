/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Transactional } from '@mikro-orm/mariadb';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TreeRepository } from 'src/db/entities/tree.entity';
import { DirectoryRepository } from 'src/modules/directories/directory.repository';
import { DirectoryAlreadyExistsException } from 'src/modules/directories/exceptions/DirectoryAlreadyExistsException';
import { DirectoryNotFoundException } from 'src/modules/directories/exceptions/DirectoryNotFoundException';
import { RootCannotBeDeletedException } from 'src/modules/directories/exceptions/RootCannotBeDeletedException';
import { RootCannotBeRenamedException } from 'src/modules/directories/exceptions/RootCannotBeRenamed';
import { DirectoryContentDto } from 'src/modules/directories/mapping/content/DirectoryContentDto';
import { DirectoryContentResponse } from 'src/modules/directories/mapping/content/DirectoryContentResponse';
import { DirectoryCreateDto } from 'src/modules/directories/mapping/create/DirectoryCreateDto';
import { DirectoryCreateResponse } from 'src/modules/directories/mapping/create/DirectoryCreateResponse';
import { DirectoryDeleteDto } from 'src/modules/directories/mapping/delete/DirectoryDeleteDto';
import { DirectoryDownloadDto } from 'src/modules/directories/mapping/download/DirectoryDownloadDto';
import { DirectoryDownloadResponse } from 'src/modules/directories/mapping/download/DirectoryDownloadResponse';
import { DirectoryMetadataDto } from 'src/modules/directories/mapping/metadata/DirectoryMetadataDto';
import { DirectoryMetadataResponse } from 'src/modules/directories/mapping/metadata/DirectoryMetadataResponse';
import { DirectoryRenameDto } from 'src/modules/directories/mapping/rename/DirectoryRenameDto';
import { StoragePath } from 'src/modules/disk/DiskService';
import { FilesRepository } from 'src/modules/files/files.repository';
import { InsufficientPermissionException } from 'src/shared/exceptions/InsufficientPermissionException';
import { FileUtils } from 'src/util/FileUtils';
import { PathUtils } from 'src/util/PathUtils';

@Injectable()
export class DirectoryService {
	public constructor(
		private readonly configService: ConfigService,
		private readonly directoryRepository: DirectoryRepository,
		private readonly filesRepository: FilesRepository,
		private readonly treeRepository: TreeRepository
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
	public async create(directoryCreateDto: DirectoryCreateDto): Promise<DirectoryCreateResponse> {
		const parentDirectory = await this.directoryRepository.findOne({ id: directoryCreateDto.parentId });

		if (parentDirectory?.user.id !== directoryCreateDto.userId) {
			throw new InsufficientPermissionException();
		}

		const existingDirectory = await this.directoryRepository.findOne({
			parent: directoryCreateDto.parentId,
			name: directoryCreateDto.name,
			user: directoryCreateDto.userId,
		});

		if (existingDirectory) {
			throw new DirectoryAlreadyExistsException(directoryCreateDto.name);
		}

		const directory = this.directoryRepository.create({
			parent: directoryCreateDto.parentId,
			name: directoryCreateDto.name,
			user: directoryCreateDto.userId,
		});

		await this.directoryRepository.nativeUpdate({ id: parentDirectory.id }, { updatedAt: new Date() });

		return DirectoryCreateResponse.from(directory.id);
	}

	@Transactional()
	public async contents(directoryContentDto: DirectoryContentDto): Promise<DirectoryContentResponse> {
		const directory = await this.directoryRepository.findOne({ id: directoryContentDto.directoryId });

		if (directory?.user.id !== directoryContentDto.userId) {
			throw new InsufficientPermissionException();
		}

		if (!directory) {
			throw new DirectoryNotFoundException(directoryContentDto.directoryId);
		}

		const { files, directories } = await this.directoryRepository.getContents(directory, this.filesRepository, this.treeRepository);

		return DirectoryContentResponse.from(files, directories);
	}

	@Transactional()
	public async metadata(directoryMetadataDto: DirectoryMetadataDto): Promise<DirectoryMetadataResponse> {
		const directory = await this.directoryRepository.findOne({ id: directoryMetadataDto.directoryId });

		if (directory?.user.id !== directoryMetadataDto.userId) {
			throw new InsufficientPermissionException();
		}

		if (!directory) {
			throw new DirectoryNotFoundException(directoryMetadataDto.directoryId);
		}

		const metadata = await this.directoryRepository.getMetadata(directory, this.filesRepository, this.treeRepository);

		return DirectoryMetadataResponse.from(metadata);
	}

	@Transactional()
	public async download(directoryDownloadDto: DirectoryDownloadDto): Promise<DirectoryDownloadResponse> {
		const directory = await this.directoryRepository.findOne({ id: directoryDownloadDto.directoryId });

		if (directory?.user.id !== directoryDownloadDto.userId) {
			throw new InsufficientPermissionException();
		}

		if (!directory) {
			throw new DirectoryNotFoundException(directoryDownloadDto.directoryId);
		}

		const { files, directories } = await this.directoryRepository.getContentsRecursive(
			directory,
			this.filesRepository,
			this.treeRepository
		);

		const relativeFilePaths = PathUtils.buildFilePaths(directory.id, files, directories);

		const readable = await FileUtils.createZIPArchive(this.configService, relativeFilePaths);

		return DirectoryDownloadResponse.from(directory.name + '.zip', 'application/zip', readable);
	}

	@Transactional()
	public async rename(directoryRenameDto: DirectoryRenameDto): Promise<void> {
		const directory = await this.directoryRepository.findOne({ id: directoryRenameDto.directoryId });

		if (directory?.user.id !== directoryRenameDto.userId) {
			throw new InsufficientPermissionException();
		}

		if (!directory) {
			throw new DirectoryNotFoundException(directoryRenameDto.directoryId);
		}

		const root = await this.getRoot(directoryRenameDto.userId);

		if (directory.id === root.id) {
			throw new RootCannotBeRenamedException();
		}

		const existingDirectory = await this.directoryRepository.findOne({
			parent: directory.parent,
			name: directoryRenameDto.name,
			user: directoryRenameDto.userId,
		});

		if (existingDirectory) {
			throw new DirectoryAlreadyExistsException(directoryRenameDto.name);
		}

		await this.directoryRepository.nativeUpdate({ id: directory.id }, { name: directoryRenameDto.name });

		await this.directoryRepository.nativeUpdate({ id: directory.parent!.id }, { updatedAt: new Date() });
	}

	@Transactional()
	public async delete(directoryDeleteDto: DirectoryDeleteDto): Promise<void> {
		const directory = await this.directoryRepository.findOne({ id: directoryDeleteDto.directoryId });

		if (directory?.user.id !== directoryDeleteDto.userId) {
			throw new InsufficientPermissionException();
		}

		if (!directory) {
			throw new DirectoryNotFoundException(directoryDeleteDto.directoryId);
		}

		const root = await this.getRoot(directoryDeleteDto.userId);

		if (directory.id === root.id) {
			throw new RootCannotBeDeletedException();
		}

		await this.directoryRepository.nativeDelete({ id: directoryDeleteDto.directoryId });

		await this.directoryRepository.nativeUpdate({ id: directory.parent!.id }, { updatedAt: new Date() });

		const { files } = await this.directoryRepository.getContentsRecursive(directory, this.filesRepository, this.treeRepository);

		for (const file of files) {
			const filepath = PathUtils.join(this.configService, StoragePath.Data, PathUtils.uuidToDirPath(file.id));

			await FileUtils.deleteFile(filepath);
		}
	}
}
