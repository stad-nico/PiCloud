import { Connection } from 'src/db/Connection';
import { Repository } from 'src/db/Repository';
import { File } from 'src/db/entities/File';
import { hardDeleteByUuid, selectByPathAndNotRecycled } from 'src/db/queries/File';

export class FileRepository extends Repository {
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
