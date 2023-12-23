import { TransactionalConnection } from 'src/db/Connection';

export interface IDatabaseService {
	executePreparedStatement<T>(query: string, params: Record<string, string | boolean | number>): Promise<Partial<T> | null>;
	startTransaction(): Promise<void>;
	rollbackTransaction(): Promise<void>;
	commitTransaction(): Promise<void>;

	getConnection(): Promise<TransactionalConnection>;
}
