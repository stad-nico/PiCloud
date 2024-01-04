// import { Connection } from 'src/db/Connection';
// import { IDatabaseService } from 'src/db/DatabaseService';
// import { IRepository, Repository } from 'src/db/Repository';
// import { File, FileNullables } from 'src/db/entities/File';

// export const IFileRepository = Symbol('IFileRepository');

// export type NarrowedNullable<T extends keyof File> = {
// 	[K in T]: K extends FileNullables ? File[K] | null : File[K];
// };

// export type RecursiveWhere<T extends keyof File> = NarrowedNullable<keyof Pick<File, 'parent'>> & Partial<NarrowedNullable<T>>;

// export interface IFileRepository extends IRepository {
// 	selectOne<T extends keyof File, K extends keyof File>(
// 		connection: Connection,
// 		where: NarrowedNullable<T>,
// 		columns: Array<K>
// 	): Promise<NarrowedNullable<K> | null>;

// 	selectAll<T extends keyof File, K extends keyof File>(
// 		connection: Connection,
// 		where: NarrowedNullable<T>,
// 		columns: Array<K>
// 	): Promise<Array<NarrowedNullable<K>>>;

// 	selectAllRecursive<T extends keyof File, K extends keyof File>(
// 		connection: Connection,
// 		where: RecursiveWhere<T>,
// 		columns: Array<K>
// 	): Promise<Array<NarrowedNullable<K>>>;

// 	getSizeAndUuidByPathAndNotRecycled(connection: Connection, path: string): Promise<Pick<File, 'uuid' | 'size'> | null>;

// 	getPathByUuidAndRecycled(connection: Connection, path: string): Promise<{ path: string } | null>;

// 	getUuidByPathAndNotRecycled(connection: Connection, path: string): Promise<Pick<File, 'uuid'> | null>;

// 	hardDeleteByUuid(connection: Connection, uuid: string): Promise<void>;

// 	insertAndSelectUuidAndPath(
// 		connection: Connection,
// 		file: Pick<File, 'name' | 'mimeType' | 'size' | 'parent'>
// 	): Promise<(Pick<File, 'uuid'> & { path: string }) | null>;

// 	getFullEntityByPathAndNotRecycled(connection: Connection, path: string): Promise<File | null>;

// 	getByPathAndNotRecycled(connection: Connection, path: string): Promise<Pick<File, 'uuid' | 'name' | 'mimeType'> | null>;

// 	softDeleteByUuid(connection: Connection, uuid: string): Promise<void>;

// 	restoreByUuid(connection: Connection, uuid: string): Promise<void>;
// }

// export class FileRepository extends Repository {
// 	public constructor(databaseService: IDatabaseService) {
// 		super(databaseService);
// 	}
// }
