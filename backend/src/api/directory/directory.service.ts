import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as path from 'path';
import { DirectoryCreateDto } from 'src/api/directory/mapping/create/directory.create.dto';
import { DirectoryCreateResponse } from 'src/api/directory/mapping/create/directory.create.response';
import { DirectoryDeleteDto } from 'src/api/directory/mapping/delete/directory.delete.dto';
import { DirectoryDeleteResponse } from 'src/api/directory/mapping/delete/directory.delete.response';
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

			const parentUuid = await this.directoryRepository.getUuidByPathAndNotRecycled(connection, parentPath);

			if (!parentUuid) {
				throw new ServerError(`directory at ${parentPath} does not exist`, HttpStatus.NOT_FOUND);
			}

			const directoryAlreadyExists = await this.directoryRepository.doesNotRecycledDirectoryWithParentAndNameAlreadyExist(
				connection,
				parentUuid.uuid,
				path.basename(directoryCreateDto.path)
			);

			if (directoryAlreadyExists) {
				throw new ServerError(`directory at ${directoryCreateDto.path} already exists`, HttpStatus.CONFLICT);
			}

			await this.directoryRepository.insert(connection, directoryCreateDto.toDirectory(parentUuid.uuid));

			return DirectoryCreateResponse.from(directoryCreateDto);
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
