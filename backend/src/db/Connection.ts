// import { Nullable } from 'src/api/file/repositories/DirectoryRepository';
// import { DirectorySelectOptions } from 'src/db/entities/Directory';
// import { DeleteQuery, InsertQuery, SelectQuery, UpdateQuery } from 'src/db/queries/Directory';

// export interface TransactionalConnection extends Connection {
// 	startTransaction(): Promise<void>;
// 	commitTransaction(): Promise<void>;
// 	rollbackTransaction(): Promise<void>;
// 	release(): Promise<void>;
// }

// export interface Connection {
// 	executePreparedStatement<T extends UpdateQuery | InsertQuery | DeleteQuery>(query: T): Promise<Packet>;
// 	executePreparedStatement<
// 		T extends SelectQuery<keyof DirectorySelectOptions>,
// 		K extends keyof DirectorySelectOptions = T['columns'][number],
// 	>(
// 		query: T
// 	): Promise<Array<Nullable<Pick<DirectorySelectOptions, K>>>>;
// 	release(): Promise<void>;
// }

// export enum QueryOperation {
// 	Insert,
// 	Delete,
// 	Update,
// 	Select,
// }

// export type Packet = {
// 	affectedRows: number;
// 	insertId: number;
// 	warningStatus: number;
// };
