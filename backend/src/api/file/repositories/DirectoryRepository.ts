import { Connection } from 'src/db/Connection';
import { IDatabaseService } from 'src/db/DatabaseService';
import { IRepository, Repository } from 'src/db/Repository';
import { Directory } from 'src/db/entities/Directory';
import { doesNotRecycledDirectoryWithParentAndNameAlreadyExist, getUuidByPathAndNotRecycled, insert } from 'src/db/queries/Directory';

export const IDirectoryRepository = Symbol('IDirectoryRepository');

export interface IDirectoryRepository extends IRepository {
	getUuidByPathAndNotRecycled(connection: Connection, path: string): Promise<Pick<Directory, 'uuid'> | null>;
	doesNotRecycledDirectoryWithParentAndNameAlreadyExist(connection: Connection, parentUuid: string, name: string): Promise<boolean>;
	insert(connection: Connection, directory: Pick<Directory, 'name' | 'parent'>): Promise<void>;
	softDeleteSubtreeByRootUuid(connection: Connection, rootUuid: string): Promise<void>;
	renameByPath(connection: Connection, path: string, name: string): Promise<void>;
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
		throw new Error('Method not implemented.');
	}
	renameByPath(connection: Connection, path: string, name: string): Promise<void> {
		throw new Error('Method not implemented.');
	}
}
