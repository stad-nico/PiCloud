import { Connection } from 'src/db/Connection';
import { Directory } from 'src/db/entities/Directory';

export const IDirectoryRepository = Symbol('IDirectoryRepository');

export interface IDirectoryRepository {
	getUuidByPathAndNotRecycled(connection: Connection, path: string): Promise<Pick<Directory, 'uuid'> | null>;
}
