// import { Connection } from 'src/db/Connection';
// import { IDatabaseService } from 'src/db/DatabaseService';
// import { IRepository, Repository } from 'src/db/Repository';
// import { Directory2, SelectKeys, SelectOneResult, SelectOptions, WhereKeys, WhereOptions } from 'src/db/entities/Directory';

// export const IDirectoryRepository = Symbol('IDirectoryRepository');

// export type Nullable<T> = { [K in keyof T]: T[K] | null };

// export interface IDirectoryRepository extends IRepository<Directory2> {
// 	selectOne<W extends WhereKeys<Directory2>, S extends SelectKeys<Directory2>>(
// 		connection: Connection,
// 		where: WhereOptions<Directory2, W>,
// 		select: SelectOptions<Directory2>
// 	): Promise<SelectOneResult>;
// 	// update<W extends WhereKeys, S extends keyof Directory>(
// 	// 	connection: Connection,
// 	// 	where: WhereOptions<W>,
// 	// 	partial: UpdatePartial<S>
// 	// ): Promise<void>;
// 	// hardDelete<W extends WhereKeys>(connection: Connection, where: WhereOptions<W>): Promise<void>;
// 	// softDelete<W extends WhereKeys>(connection: Connection, where: SoftDeleteWhereOptions<W>): Promise<void>;
// 	// insert<T extends keyof Directory>(connection: Connection, values: InsertPartial<T>): Promise<void>;
// }

// export class DirectoryRepository extends Repository<Directory2> implements IDirectoryRepository {
// 	public constructor(databaseService: IDatabaseService) {
// 		super(databaseService);
// 	}

// 	public async selectOne<S extends SelectKeys<Directory2>>(
// 		connection: Connection,
// 		where: WhereOptions<Directory2, WhereKeys<Directory2>>,
// 		select: SelectOptions<Directory2, SelectKeys<Directory2>>
// 	): Promise<SelectOneResult<Directory2, SelectKeys<Directory2>>> {
// 		throw new Error('Method not implemented.');
// 	}

// 	// public async hardDelete<W extends WhereKeys>(connection: Connection, where: WhereOptions<W>): Promise<void> {
// 	// 	await connection.executePreparedStatement(hardDelete(where));
// 	// }

// 	// public async softDelete<W extends WhereKeys>(connection: Connection, where: SoftDeleteWhereOptions<W>): Promise<void> {
// 	// 	await connection.executePreparedStatement(softDelete(where));
// 	// }

// 	// public async insert<T extends keyof Directory>(connection: Connection, values: InsertPartial<T>): Promise<void> {
// 	// 	await connection.executePreparedStatement(insert(values));
// 	// }

// 	// public async update<T extends keyof DirectorySelectOptions, K extends keyof Directory>(
// 	// 	connection: Connection,
// 	// 	where: WhereOptions<T>,
// 	// 	partial: UpdatePartial<K>
// 	// ): Promise<void> {
// 	// 	await connection.executePreparedStatement(update(where, partial));
// 	// }

// 	// public async selectAll<W extends WhereKeys, S extends SelectKeys>(
// 	// 	connection: Connection,
// 	// 	where: WhereOptions<W>,
// 	// 	columns: SelectOptions<S>
// 	// ): Promise<SelectAllResult<S>> {
// 	// 	const rawResult = await connection.executePreparedStatement(selectAll(where, columns));

// 	// 	const result = this.map(rawResult);

// 	// 	return result;
// 	// }

// 	// private map<S extends SelectKeys>(rows: Array<Nullable<Pick<DirectorySelectOptions, S>>>): Array<ValidEntity<S>> {
// 	// 	const result: Array<ValidEntity<S>> = [];

// 	// 	for (const row of rows) {
// 	// 		if (this.isValid(row)) {
// 	// 			result.push(row);
// 	// 		}
// 	// 	}

// 	// 	return result;
// 	// }

// 	// public isValid<S extends SelectKeys>(row: Nullable<Pick<DirectorySelectOptions, S>>): row is ValidEntity<S> {
// 	// 	const entries = Object.entries(row) as Array<[S, unknown]>;

// 	// 	for (let [row, value] of entries) {
// 	// 		if (value === null && !DirectoryNullables.includes(row)) {
// 	// 			return false;
// 	// 		}
// 	// 	}

// 	// 	return true;
// 	// }
// }
