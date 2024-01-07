import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { DirectoryRepository } from 'src/api/directory/directory.repository';
import { DirectoryContentResponse } from 'src/api/directory/mapping/content/directory.content.response';
import { DirectoryCreateDto } from 'src/api/directory/mapping/create/directory.create.dto';
import { DirectoryCreateResponse } from 'src/api/directory/mapping/create/directory.create.response';
import { DirectoryDeleteDto } from 'src/api/directory/mapping/delete/directory.delete.dto';
import { DirectoryDeleteResponse } from 'src/api/directory/mapping/delete/directory.delete.response';
import { DirectoryDownloadDto } from 'src/api/directory/mapping/download/directory.download.dto';
import { DirectoryMetadataDto } from 'src/api/directory/mapping/metadata/directory.metadata.dto';
import { DirectoryMetadataResponse } from 'src/api/directory/mapping/metadata/directory.metadata.response';
import { ServerError } from 'src/util/ServerError';
import { DataSource } from 'typeorm';
import { DirectoryContentDto } from './mapping/content/directory.content.dto';

@Injectable()
export class DirectoryService {
	private readonly dataSource: DataSource;

	private readonly repository: DirectoryRepository;

	private readonly configService: ConfigService;

	public constructor(dataSource: DataSource, repository: DirectoryRepository, configService: ConfigService) {
		this.dataSource = dataSource;
		this.repository = repository;
		this.configService = configService;
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

			return DirectoryMetadataResponse.from({ path: directoryMetadataDto.path, ...metadata });
		});
	}

	public async content(directoryContentDto: DirectoryContentDto): Promise<DirectoryContentResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			if (!(await this.repository.exists(entityManager, directoryContentDto.path))) {
				throw new ServerError(`directory at ${directoryContentDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			const content = await this.repository.getContent(entityManager, directoryContentDto.path);

			return DirectoryContentResponse.from(content);
		});
	}

	public async download(directoryDownloadDto: DirectoryDownloadDto): Promise<DirectoryDeleteResponse> {
		return this.dataSource.transaction(async (entityManager) => {
			const directory = await this.repository.select(entityManager, directoryDownloadDto.path);

			if (!directory) {
				throw new ServerError(`directory at ${directoryDownloadDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			// const files = await

			// const archive = await FileUtils.createZIPArchive(this.configService, );

			// return DirectoryDownloadResponse.from(directory.name + ".zip", "application/zip", archive);
			return 0 as any;
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
