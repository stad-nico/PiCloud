/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Transactional } from '@mikro-orm/mariadb';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DirectoriesRepository } from 'src/modules/directories/directories.repository';
import { DirectoryContentDto, DirectoryContentResponse } from 'src/modules/directories/mapping/content';
import { DirectoryCreateDto, DirectoryCreateResponse } from 'src/modules/directories/mapping/create';
import { DirectoryDeleteDto } from 'src/modules/directories/mapping/delete';
import { DirectoryDownloadDto, DirectoryDownloadResponse } from 'src/modules/directories/mapping/download';
import { DirectoryMetadataDto, DirectoryMetadataResponse } from 'src/modules/directories/mapping/metadata';
import { DirectoryRenameDto } from 'src/modules/directories/mapping/rename';
import { StoragePath } from 'src/modules/disk/DiskService';
import { DirectoryAlreadyExistsException } from 'src/shared/exceptions/DirectoryAlreadyExistsException';
import { DirectoryNotFoundException } from 'src/shared/exceptions/DirectoryNotFoundException';
import { RootCannotBeDeletedException } from 'src/shared/exceptions/RootCannotBeDeletedException';
import { RootCannotBeRenamedException } from 'src/shared/exceptions/RootCannotBeRenamed';
import { FileUtils } from 'src/util/FileUtils';
import { PathUtils } from 'src/util/PathUtils';

@Injectable()
export class DirectoriesService {
	private readonly configService: ConfigService;

	private readonly directoriesRepository: DirectoriesRepository;

	public constructor(configService: ConfigService, directoriesRepository: DirectoriesRepository) {
		this.configService = configService;
		this.directoriesRepository = directoriesRepository;
	}

	@Transactional()
	public async getRoot(userId: string): Promise<{ id: string }> {
		const rootDirectory = await this.directoriesRepository.findOne({ parent: null, user: userId });

		if (!rootDirectory) {
			throw new NotFoundException();
		}

		return { id: rootDirectory.id };
	}

	@Transactional()
	public async create(directoryCreateDto: DirectoryCreateDto): Promise<DirectoryCreateResponse> {
		const parentDirectory = await this.directoriesRepository.findOne({ id: directoryCreateDto.parentId });

		if (!parentDirectory || parentDirectory.user.id !== directoryCreateDto.userId) {
			throw new UnauthorizedException();
		}

		const existingDirectory = await this.directoriesRepository.findOne({
			parent: directoryCreateDto.parentId,
			name: directoryCreateDto.name,
			user: directoryCreateDto.userId,
		});

		if (existingDirectory) {
			throw new DirectoryAlreadyExistsException(directoryCreateDto.name);
		}

		const directory = this.directoriesRepository.create({
			parent: directoryCreateDto.parentId,
			name: directoryCreateDto.name,
			user: directoryCreateDto.userId,
		});

		return DirectoryCreateResponse.from(directory.id);
	}

	@Transactional()
	public async contents(directoryContentDto: DirectoryContentDto): Promise<DirectoryContentResponse> {
		const directory = await this.directoriesRepository.findOne({ id: directoryContentDto.directoryId });

		if (directory?.user.id !== directoryContentDto.userId) {
			throw new UnauthorizedException();
		}

		if (!directory.user.id) {
			throw new DirectoryNotFoundException(directoryContentDto.directoryId);
		}

		const content = await this.directoriesRepository.getContents(directory.id, directory.user.id);

		return DirectoryContentResponse.from(content);
	}

	@Transactional()
	public async metadata(directoryMetadataDto: DirectoryMetadataDto): Promise<DirectoryMetadataResponse> {
		const directory = await this.directoriesRepository.findOne({ id: directoryMetadataDto.directoryId });

		if (directory?.user.id !== directoryMetadataDto.userId) {
			throw new UnauthorizedException();
		}

		if (!directory.id) {
			throw new DirectoryNotFoundException(directoryMetadataDto.directoryId);
		}

		const metadata = await this.directoriesRepository.getMetadata(directoryMetadataDto.directoryId, directoryMetadataDto.userId);

		if (!metadata) {
			throw new DirectoryNotFoundException(directoryMetadataDto.directoryId);
		}

		return DirectoryMetadataResponse.from(metadata);
	}

	@Transactional()
	public async download(directoryDownloadDto: DirectoryDownloadDto): Promise<DirectoryDownloadResponse> {
		const directory = await this.directoriesRepository.findOne({ id: directoryDownloadDto.directoryId });

		if (directory?.user.id !== directoryDownloadDto.userId) {
			throw new UnauthorizedException();
		}

		if (!directory.id) {
			throw new DirectoryNotFoundException(directoryDownloadDto.directoryId);
		}

		const { files, directories } = await this.directoriesRepository.getContentsRecursive(directoryDownloadDto.directoryId);

		const relativeFilePaths = PathUtils.buildFilePaths(directory.id, files, directories);

		const readable = await FileUtils.createZIPArchive(this.configService, relativeFilePaths);

		return DirectoryDownloadResponse.from(directory.name + '.zip', 'application/zip', readable);
	}

	@Transactional()
	public async rename(directoryRenameDto: DirectoryRenameDto): Promise<void> {
		const directory = await this.directoriesRepository.findOne({ id: directoryRenameDto.directoryId });

		if (directory?.user.id !== directoryRenameDto.userId) {
			throw new UnauthorizedException();
		}

		if (!directory.id) {
			throw new DirectoryNotFoundException(directoryRenameDto.directoryId);
		}

		const root = await this.getRoot(directoryRenameDto.userId);

		if (directory.id === root.id) {
			throw new RootCannotBeRenamedException();
		}

		const existingDirectory = await this.directoriesRepository.findOne({
			parent: directory.parent,
			name: directoryRenameDto.name,
			user: directoryRenameDto.userId,
		});

		if (existingDirectory) {
			throw new DirectoryAlreadyExistsException(directoryRenameDto.name);
		}

		await this.directoriesRepository.upsert({ id: directory.id, parent: directory.parent, name: directoryRenameDto.name });
	}

	@Transactional()
	public async delete(directoryDeleteDto: DirectoryDeleteDto): Promise<void> {
		const directory = await this.directoriesRepository.findOne({ id: directoryDeleteDto.directoryId });

		if (directory?.user.id !== directoryDeleteDto.userId) {
			throw new UnauthorizedException();
		}

		if (!directory.id) {
			throw new DirectoryNotFoundException(directoryDeleteDto.directoryId);
		}

		const root = await this.getRoot(directoryDeleteDto.userId);

		if (directory.id === root.id) {
			throw new RootCannotBeDeletedException();
		}

		await this.directoriesRepository.nativeDelete({ id: directoryDeleteDto.directoryId });

		const { files } = await this.directoriesRepository.getContentsRecursive(directoryDeleteDto.directoryId);

		for (const file of files) {
			const filepath = PathUtils.join(this.configService, StoragePath.Data, PathUtils.uuidToDirPath(file.id));

			await FileUtils.deleteFile(filepath);
		}
	}
}
