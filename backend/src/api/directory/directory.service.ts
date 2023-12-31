import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as path from 'path';
import { DirectoryContentDto } from 'src/api/directory/mapping/content/directory.content.dto';
import { DirectoryContentResponse } from 'src/api/directory/mapping/content/directory.content.response';
import { DirectoryCreateDto } from 'src/api/directory/mapping/create/directory.create.dto';
import { DirectoryCreateResponse } from 'src/api/directory/mapping/create/directory.create.response';
import { DirectoryDeleteDto } from 'src/api/directory/mapping/delete/directory.delete.dto';
import { DirectoryDeleteResponse } from 'src/api/directory/mapping/delete/directory.delete.response';
import { DirectoryMetadataDto } from 'src/api/directory/mapping/metadata/directory.metadata.dto';
import { DirectoryMetadataResponse } from 'src/api/directory/mapping/metadata/directory.metadata.response';
import { DirectoryRenameDto } from 'src/api/directory/mapping/rename/directory.rename.dto';
import { DirectoryRenameResponse } from 'src/api/directory/mapping/rename/directory.rename.response';
import { IDirectoryRepository } from 'src/api/file/repositories/DirectoryRepository';
import { ServerError } from 'src/util/ServerError';

@Injectable()
export class DirectoryService {
	private readonly directoryRepository: IDirectoryRepository;

	public constructor(@Inject(IDirectoryRepository) directoryRepository: IDirectoryRepository) {
		this.directoryRepository = directoryRepository;
	}

	public async create(directoryCreateDto: DirectoryCreateDto): Promise<DirectoryCreateResponse> {
		return await this.directoryRepository.transactional(async (connection) => {
			const parentPath = path.dirname(directoryCreateDto.path);

			const parent = await this.directoryRepository.getUuidByPathAndNotRecycled(connection, parentPath);

			if (!parent) {
				throw new ServerError(`directory at ${parentPath} does not exist`, HttpStatus.NOT_FOUND);
			}

			const directoryAlreadyExists = await this.directoryRepository.doesNotRecycledDirectoryWithParentAndNameAlreadyExist(
				connection,
				parent.uuid,
				path.basename(directoryCreateDto.path)
			);

			if (directoryAlreadyExists) {
				throw new ServerError(`directory at ${directoryCreateDto.path} already exists`, HttpStatus.CONFLICT);
			}

			await this.directoryRepository.insert(connection, directoryCreateDto.toDirectory(parent.uuid));

			return DirectoryCreateResponse.from(directoryCreateDto);
		});
	}

	public async metadata(directoryMetadataDto: DirectoryMetadataDto): Promise<DirectoryMetadataResponse> {
		return await this.directoryRepository.transactional(async (connection) => {
			console.log(directoryMetadataDto.path);
			const directory = await this.directoryRepository.getUuidByPathAndNotRecycled(connection, directoryMetadataDto.path);

			if (!directory) {
				throw new ServerError(`directory at ${directoryMetadataDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			const response = await this.directoryRepository.getMetadataByUuid(connection, directory.uuid);

			if (!response) {
				throw new ServerError(`directory at ${directoryMetadataDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			return DirectoryMetadataResponse.from(response);
		});
	}

	public async content(directoryContentDto: DirectoryContentDto): Promise<DirectoryContentResponse> {
		return await this.directoryRepository.transactional(async (connection) => {
			console.log(directoryContentDto.path);
			const directory = await this.directoryRepository.getUuidByPathAndNotRecycled(connection, directoryContentDto.path);

			if (!directory) {
				throw new ServerError(`directory at ${directoryContentDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			const content = await this.directoryRepository.getContentByUuid(connection, directory.uuid);

			if (!content) {
				throw new ServerError(`directory at ${directoryContentDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			return DirectoryContentResponse.from(content.files, content.directories);
		});
	}

	public async rename(directoryRenameDto: DirectoryRenameDto): Promise<DirectoryRenameResponse> {
		return await this.directoryRepository.transactional(async (connection) => {
			const sourceDirectory = await this.directoryRepository.getUuidByPathAndNotRecycled(connection, directoryRenameDto.sourcePath);

			if (!sourceDirectory) {
				throw new ServerError(`directory at ${directoryRenameDto.sourcePath} does not exist`, HttpStatus.NOT_FOUND);
			}

			const destinationParentPath = path.dirname(directoryRenameDto.destPath);
			const destinationParent = await this.directoryRepository.getUuidByPathAndNotRecycled(connection, destinationParentPath);

			if (!destinationParent) {
				throw new ServerError(`directory at ${destinationParentPath} does not exist`, HttpStatus.NOT_FOUND);
			}

			const destinationName = path.basename(directoryRenameDto.destPath);
			const destinationDirectory = await this.directoryRepository.getUuidByParentAndNameAndNotRecycled(
				connection,
				destinationParent.uuid,
				destinationName
			);

			if (destinationDirectory && !directoryRenameDto.overwrite) {
				throw new ServerError(`directory at ${directoryRenameDto.destPath} already exists`, HttpStatus.CONFLICT);
			}

			if (destinationDirectory && directoryRenameDto.overwrite) {
				await this.directoryRepository.hardDeleteByUuid(connection, destinationDirectory.uuid);
			}

			await this.directoryRepository.renameByUuid(connection, sourceDirectory.uuid, path.basename(directoryRenameDto.destPath));

			if (path.dirname(directoryRenameDto.sourcePath) !== path.dirname(directoryRenameDto.destPath)) {
				await this.directoryRepository.updateParentByUuid(connection, sourceDirectory.uuid, destinationParent.uuid);
			}

			return DirectoryRenameResponse.from(directoryRenameDto);
		});
	}

	public async delete(directoryDeleteDto: DirectoryDeleteDto): Promise<DirectoryDeleteResponse> {
		return await this.directoryRepository.transactional(async (connection) => {
			const directory = await this.directoryRepository.getUuidByPathAndNotRecycled(connection, directoryDeleteDto.path);

			if (!directory) {
				throw new ServerError(`directory at ${directoryDeleteDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			await this.directoryRepository.softDeleteSubtreeByRootUuid(connection, directory.uuid);

			return DirectoryDeleteResponse.from(directory.uuid);
		});
	}
}
