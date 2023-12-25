import { TransactionalConnection } from 'src/db/Connection';

export interface IDatabaseService {
	getConnection(): Promise<TransactionalConnection>;
}
