import { Connection } from 'src/db/Connection';
import { IDatabaseService } from 'src/db/DatabaseService';
import { IRepository, Repository } from 'src/db/Repository';
import { File } from 'src/db/entities/File';
import { hardDeleteByUuid, selectByPathAndNotRecycled } from 'src/db/queries/File';

export const IFileRepository = Symbol('IFileRepository');

export interface IFileRepository extends IRepository {
	getSizeAndUuidByPathAndNotRecycled(connection: Connection, path: string): Promise<Pick<File, 'uuid' | 'size'> | null>;

	getPathByUuidAndRecycled(connection: Connection, path: string): Promise<{ path: string } | null>;

	getUuidByPathAndNotRecycled(connection: Connection, path: string): Promise<Pick<File, 'uuid'> | null>;

	hardDeleteByUuid(connection: Connection, uuid: string): Promise<void>;

	insertAndSelectUuidAndPath(
		connection: Connection,
		file: Pick<File, 'name' | 'mimeType' | 'size' | 'parent'>
	): Promise<(Pick<File, 'uuid'> & { path: string }) | null>;

	getFullEntityByPathAndNotRecycled(connection: Connection, path: string): Promise<File | null>;

	getByPathAndNotRecycled(connection: Connection, path: string): Promise<Pick<File, 'uuid' | 'name' | 'mimeType'> | null>;

	softDeleteByUuid(connection: Connection, uuid: string): Promise<void>;

	restoreByUuid(connection: Connection, uuid: string): Promise<void>;
}

export class FileRepository extends Repository {
	public constructor(databaseService: IDatabaseService) {
		super(databaseService);
	}

	private async selectByPathAndNotRecycled<T extends keyof File>(
		connection: Connection,
		path: string,
		columnsToSelect: T[]
	): Promise<Pick<File, T> | null> {
		const result = await connection.executePreparedStatement(selectByPathAndNotRecycled(path, columnsToSelect));

		if (!result) {
			return null;
		}

		return result as any;
	}

	public async hardDeleteByUuid(connection: Connection, uuid: string): Promise<void> {
		await connection.executePreparedStatement(hardDeleteByUuid(uuid));
	}

	public async getUuidByPathAndNotRecycled(connection: Connection, path: string): Promise<Pick<File, 'uuid'> | null> {
		return this.selectByPathAndNotRecycled(connection, path, ['uuid']);
	}
}
