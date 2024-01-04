import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DirectoryService {
	private readonly configService: ConfigService;

	public constructor(configService: ConfigService) {
		this.configService = configService;
	}

	// public async create(directoryCreateDto: DirectoryCreateDto): Promise<DirectoryCreateResponse> {
	// 	return await this.directoryRepository.transactional(async (connection) => {
	// 		const existingDirectory = await this.directoryRepository.selectOne(
	// 			connection,
	// 			{ path: directoryCreateDto.path, isRecycled: false },
	// 			['uuid']
	// 		);

	// 		if (existingDirectory) {
	// 			throw new ServerError(`directory at ${directoryCreateDto.path} already exists`, HttpStatus.CONFLICT);
	// 		}

	// 		const parentPath = path.dirname(directoryCreateDto.path);

	// 		const parent = await this.directoryRepository.selectOne(connection, { path: parentPath, isRecycled: false }, ['uuid']);

	// 		if (!parent) {
	// 			throw new ServerError(`directory at ${parentPath} does not exist`, HttpStatus.NOT_FOUND);
	// 		}

	// 		await this.directoryRepository.insert(connection, { name: path.basename(directoryCreateDto.path), parent: parent.uuid });

	// 		return DirectoryCreateResponse.from(directoryCreateDto);
	// 	});
	// }

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

	// public async metadata(directoryMetadataDto: DirectoryMetadataDto): Promise<DirectoryMetadataResponse> {
	// 	return await this.directoryRepository.transactional(async (connection) => {
	// 		const directory = await this.directoryRepository.selectOne(connection, { path: directoryMetadataDto.path }, ['uuid']);

	// 		if (!directory) {
	// 			throw new ServerError(`directory at ${directoryMetadataDto.path} does not exist`, HttpStatus.NOT_FOUND);
	// 		}

	// 		// prettier-ignore
	// 		const response = await this.directoryRepository.selectOne(connection, { uuid: directory.uuid },
	// 			['uuid', 'name', 'path', 'size', 'filesAmt', 'directoriesAmt', 'created', 'updated']
	// 		);

	// 		if (!response) {
	// 			throw new ServerError(`directory at ${directoryMetadataDto.path} does not exist`, HttpStatus.NOT_FOUND);
	// 		}

	// 		return DirectoryMetadataResponse.from(response);
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

	// public async delete(directoryDeleteDto: DirectoryDeleteDto): Promise<DirectoryDeleteResponse> {
	// 	return await this.directoryRepository.transactional(async (connection) => {
	// 		const directory = await this.directoryRepository.selectOne(connection, { path: directoryDeleteDto.path, isRecycled: false }, [
	// 			'uuid',
	// 		]);

	// 		if (!directory) {
	// 			throw new ServerError(`directory at ${directoryDeleteDto.path} does not exist`, HttpStatus.NOT_FOUND);
	// 		}

	// 		await this.directoryRepository.softDelete(connection, { root: directory.uuid });

	// 		return DirectoryDeleteResponse.from(directory.uuid);
	// 	});
	// }

	// public async content(directoryContentDto: DirectoryContentDto): Promise<DirectoryContentResponse> {
	// 	return 0 as any;
	// }
}
