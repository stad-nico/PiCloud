// import { Connection } from 'src/db/Connection';
// import { IDatabaseService } from 'src/db/DatabaseService';
// import { BaseEntity, SelectKeys, SelectOneResult, SelectOptions, WhereKeys, WhereOptions } from 'src/db/entities/Directory';

// export interface IRepository<Entity extends BaseEntity> {
// 	// selectAll<W extends WhereKeys<E>, S extends SelectKeys<E>>(
// 	// 	connection: Connection,
// 	// 	where: WhereOptions<E, W>,
// 	// 	select: SelectOptions<E, S>
// 	// ): Promise<SelectAllResult<E, S>>;

// 	// selectOne<W extends WhereKeys<E>, S extends SelectKeys<E>>(
// 	// 	connection: Connection,
// 	// 	where: WhereOptions<E, W>,
// 	// 	select: SelectOptions<E, S>
// 	// ): Promise<SelectOneResult<E, S>>;

// 	// update<W extends WhereKeys<E>, S>(connection: Connection, where: WhereOptions<E, W>, partial: UpdatePartial<S>): Promise<void>;

// 	transactional<T>(callback: (connection: Connection) => Promise<T>): Promise<T>;
// }

// export abstract class Repository<Entity extends BaseEntity> implements IRepository<Entity> {
// 	private readonly databaseService: IDatabaseService;

// 	protected constructor(databaseService: IDatabaseService) {
// 		this.databaseService = databaseService;
// 	}

// 	// abstract selectAll<W extends WhereKeys<Entity>, S extends SelectKeys<Entity>>(
// 	// 	connection: Connection,
// 	// 	where: WhereOptions<Entity, W>,
// 	// 	select: SelectOptions<Entity, S>
// 	// ): Promise<SelectAllResult<Entity, S>>;

// 	abstract selectOne<W extends WhereKeys<Entity>, S extends SelectKeys<Entity>>(
// 		connection: Connection,
// 		where: WhereOptions<Entity, W>,
// 		select: SelectOptions<Entity, S>
// 	): Promise<SelectOneResult<Entity, S>>;

// 	public async transactional<T>(callback: (connection: Connection) => Promise<T>): Promise<T> {
// 		const connection = await this.databaseService.getConnection();

// 		await connection.startTransaction();

// 		try {
// 			const result = await callback(connection);

// 			await connection.commitTransaction();

// 			return result;
// 		} catch (e) {
// 			await connection.rollbackTransaction();

// 			throw e;
// 		} finally {
// 			connection.release();
// 		}
// 	}
// }
