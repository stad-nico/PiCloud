import {
	DirectoryContentDirectoryType,
	DirectoryContentFileType,
	DirectoryContentResponseType,
} from 'src/api/directory/mapping/content/directory.content.response';
import { DirectoryMetadataResponseType } from 'src/api/directory/mapping/metadata/directory.metadata.response';
import { Connection } from 'src/db/Connection';
import { IDatabaseService } from 'src/db/DatabaseService';
import { IRepository, Repository } from 'src/db/Repository';
import { Directory } from 'src/db/entities/Directory';
import {
	doesNotRecycledDirectoryWithParentAndNameAlreadyExist,
	getDirectoriesContentByUuid,
	getFilesContentByUuid,
	getMetadataByUuid,
	getUuidByParentAndNameAndNotRecycled,
	getUuidByPathAndNotRecycled,
	hardDeleteByUuid,
	insert,
	renameByUuid,
	softDeleteSubtreeByRootUuid,
	updateParentByUuid,
} from 'src/db/queries/Directory';

export const IDirectoryRepository = Symbol('IDirectoryRepository');

export interface IDirectoryRepository extends IRepository {
	getUuidByPathAndNotRecycled(connection: Connection, path: string): Promise<Pick<Directory, 'uuid'> | null>;
	doesNotRecycledDirectoryWithParentAndNameAlreadyExist(connection: Connection, parentUuid: string, name: string): Promise<boolean>;
	insert(connection: Connection, directory: Pick<Directory, 'name' | 'parent'>): Promise<void>;
	softDeleteSubtreeByRootUuid(connection: Connection, rootUuid: string): Promise<void>;
	renameByUuid(connection: Connection, uuid: string, name: string): Promise<void>;
	getUuidByParentAndNameAndNotRecycled(connection: Connection, parent: string, name: string): Promise<Pick<Directory, 'uuid'> | null>;
	hardDeleteByUuid(connection: Connection, uuid: string): Promise<void>;
	updateParentByUuid(connection: Connection, uuid: string, newParent: string): Promise<void>;
	getMetadataByUuid(connection: Connection, uuid: string): Promise<DirectoryMetadataResponseType | null>;
	getContentByUuid(connection: Connection, uuid: string): Promise<DirectoryContentResponseType | null>;
}

export class DirectoryRepository extends Repository implements IDirectoryRepository {
	public constructor(databaseService: IDatabaseService) {
		super(databaseService);
	}

	public async getUuidByPathAndNotRecycled(connection: Connection, path: string): Promise<Pick<Directory, 'uuid'> | null> {
		const result = (await connection.executePreparedStatement(getUuidByPathAndNotRecycled(path))) as [Pick<Directory, 'uuid'> | null];

		return result[0];
	}

	public async doesNotRecycledDirectoryWithParentAndNameAlreadyExist(
		connection: Connection,
		parentUuid: string,
		name: string
	): Promise<boolean> {
		const result = (await connection.executePreparedStatement(
			doesNotRecycledDirectoryWithParentAndNameAlreadyExist(parentUuid, name)
		)) as [{ 'COUNT(1)': number }];

		return result[0]['COUNT(1)'] > 0;
	}

	public async insert(connection: Connection, directory: Pick<Directory, 'name' | 'parent'>): Promise<void> {
		await connection.executePreparedStatement(insert(directory.parent, directory.name));
	}

	public async softDeleteSubtreeByRootUuid(connection: Connection, rootUuid: string): Promise<void> {
		await connection.executePreparedStatement(softDeleteSubtreeByRootUuid(rootUuid));
	}

	public async renameByUuid(connection: Connection, uuid: string, name: string): Promise<void> {
		await connection.executePreparedStatement(renameByUuid(uuid, name));
	}

	public async getUuidByParentAndNameAndNotRecycled(
		connection: Connection,
		parent: string,
		name: string
	): Promise<Pick<Directory, 'uuid'> | null> {
		const result = (await connection.executePreparedStatement(getUuidByParentAndNameAndNotRecycled(parent, name))) as [
			Pick<Directory, 'uuid'> | null,
		];

		return result[0];
	}

	public async hardDeleteByUuid(connection: Connection, uuid: string): Promise<void> {
		await connection.executePreparedStatement(hardDeleteByUuid(uuid));
	}

	public async updateParentByUuid(connection: Connection, uuid: string, newParent: string): Promise<void> {
		await connection.executePreparedStatement(updateParentByUuid(uuid, newParent));
	}

	public async getMetadataByUuid(connection: Connection, uuid: string): Promise<DirectoryMetadataResponseType | null> {
		const result = (await connection.executePreparedStatement(getMetadataByUuid(uuid))) as [DirectoryMetadataResponseType | null];

		return result[0];
	}

	public async getContentByUuid(connection: Connection, uuid: string): Promise<DirectoryContentResponseType | null> {
		const files = (await connection.executePreparedStatement(getFilesContentByUuid(uuid))) as DirectoryContentFileType[];
		const directories = (await connection.executePreparedStatement(
			getDirectoriesContentByUuid(uuid)
		)) as DirectoryContentDirectoryType[];

		return {
			files: files,
			directories: directories,
		};
	}
}
