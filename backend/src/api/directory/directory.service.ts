import { HttpStatus, Injectable } from '@nestjs/common';
import * as path from 'path';
import { DirectoryRepository } from 'src/api/directory/directory.repository';
import { DirectoryCreateDto } from 'src/api/directory/mapping/create/directory.create.dto';
import { DirectoryCreateResponse } from 'src/api/directory/mapping/create/directory.create.response';
import { DirectoryDeleteDto } from 'src/api/directory/mapping/delete/directory.delete.dto';
import { DirectoryDeleteResponse } from 'src/api/directory/mapping/delete/directory.delete.response';
import { DirectoryMetadataDto } from 'src/api/directory/mapping/metadata/directory.metadata.dto';
import { DirectoryMetadataResponse } from 'src/api/directory/mapping/metadata/directory.metadata.response';
import { ServerError } from 'src/util/ServerError';
import { DataSource } from 'typeorm';

@Injectable()
export class DirectoryService {
	private readonly dataSource: DataSource;

	private readonly repository: DirectoryRepository;

	public constructor(dataSource: DataSource, repository: DirectoryRepository) {
		this.dataSource = dataSource;
		this.repository = repository;
	}

	public async create(directoryCreateDto: DirectoryCreateDto): Promise<DirectoryCreateResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			if (await this.repository.exists(entityManager, directoryCreateDto.path)) {
				throw new ServerError(`directory at ${directoryCreateDto.path} already exists`, HttpStatus.CONFLICT);
			}

			const parentPath = path.dirname(directoryCreateDto.path);
			const hasRootAsParent = path.relative('.', parentPath) === '';

			const parent = await this.repository.select(entityManager, parentPath, false);

			if (!parent && !hasRootAsParent) {
				throw new ServerError(`directory at ${parentPath} does not exist`, HttpStatus.NOT_FOUND);
			}

			const parentId = hasRootAsParent ? null : parent!.uuid;

			await this.repository.insert(entityManager, path.basename(directoryCreateDto.path), parentId);

			return DirectoryCreateResponse.from(directoryCreateDto.path);
		});
	}

	public async delete(directoryDeleteDto: DirectoryDeleteDto): Promise<DirectoryDeleteResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			const directory = await this.repository.select(entityManager, directoryDeleteDto.path, false);

			if (!directory) {
				throw new ServerError(`directory at ${directoryDeleteDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			await this.repository.softDelete(entityManager, directory.uuid);

			return DirectoryDeleteResponse.from(directory.uuid);
		});
	}

	public async metadata(directoryMetadataDto: DirectoryMetadataDto): Promise<DirectoryMetadataResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			const metadata = await this.repository.getMetadata(entityManager, directoryMetadataDto.path);

			if (!metadata) {
				throw new ServerError(`directory at ${directoryMetadataDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			return DirectoryMetadataResponse.from(metadata);
		});
	}

	// public async download(directoryDownloadDto: DirectoryDownloadDto): Promise<DirectoryDownloadResponse> {
	// 	const r = await this.directoryRepository.selectOne(connection, { parent: null, path: 'X' }, ['uuid', 'parent']);

	// 	return await this.directoryRepository.transactional(async (connection) => {
	// 		const directory = await this.directoryRepository.selectOne(connection, { path: directoryDownloadDto.path, isRecycled: false }, [
	// 			'uuid',
	// 			'path',
	// 			'name',
	// 		]);

	// 		if (!directory) {
	// 			throw new ServerError(`directory at ${directoryDownloadDto.path} does not exist`, HttpStatus.NOT_FOUND);
	// 		}

	// 		let contents = await this.fileRepository.selectAllRecursive(connection, { parent: directory.uuid }, ['uuid', 'path']);
	// 		contents = contents.map((x) => ({ uuid: x.uuid, path: x.path.replace(directory.path, '') }));

	// 		const archive = await FileUtils.createZIPArchive(this.configService, contents);

	// 		return DirectoryDownloadResponse.from(directory.name + '.zip', 'application/zip', archive);
	// 	});
	// }

	// public async rename(directoryRenameDto: DirectoryRenameDto): Promise<DirectoryRenameResponse> {
	// 	return await this.directoryRepository.transactional(async (connection) => {
	// 		const sourceDirectory = await this.directoryRepository.selectOne(connection, { path: directoryRenameDto.sourcePath }, ['uuid']);

	// 		if (!sourceDirectory) {
	// 			throw new ServerError(`directory at ${directoryRenameDto.sourcePath} does not exist`, HttpStatus.NOT_FOUND);
	// 		}

	// 		const destinationParentPath = path.dirname(directoryRenameDto.destPath);
	// 		const destinationParent = await this.directoryRepository.selectOne(
	// 			connection,
	// 			{ path: destinationParentPath, isRecycled: false },
	// 			['uuid']
	// 		);

	// 		if (!destinationParent) {
	// 			throw new ServerError(`directory at ${destinationParentPath} does not exist`, HttpStatus.NOT_FOUND);
	// 		}

	// 		const destinationName = path.basename(directoryRenameDto.destPath);
	// 		const destinationDirectory = await this.directoryRepository.selectOne(
	// 			connection,
	// 			{ parent: destinationParent.uuid, name: destinationName, isRecycled: false },
	// 			['uuid']
	// 		);

	// 		if (destinationDirectory && !directoryRenameDto.overwrite) {
	// 			throw new ServerError(`directory at ${directoryRenameDto.destPath} already exists`, HttpStatus.CONFLICT);
	// 		}

	// 		if (destinationDirectory && directoryRenameDto.overwrite) {
	// 			await this.directoryRepository.hardDelete(connection, { uuid: destinationDirectory.uuid });
	// 		}

	// 		await this.directoryRepository.update(
	// 			connection,
	// 			{ uuid: sourceDirectory.uuid },
	// 			{ name: path.basename(directoryRenameDto.destPath) }
	// 		);

	// 		if (path.dirname(directoryRenameDto.sourcePath) !== path.dirname(directoryRenameDto.destPath)) {
	// 			await this.directoryRepository.update(connection, { uuid: sourceDirectory.uuid }, { parent: destinationParent.uuid });
	// 		}

	// 		return DirectoryRenameResponse.from(directoryRenameDto);
	// 	});
	// }
}
