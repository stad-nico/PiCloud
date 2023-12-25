import { QueryBundle } from 'src/db/queries/File';

export interface TransactionalConnection extends Connection {
	startTransaction(): Promise<void>;
	commitTransaction(): Promise<void>;
	rollbackTransaction(): Promise<void>;
	release(): Promise<void>;
}

export interface Connection {
	executePreparedStatement(queryBundle: QueryBundle): Promise<any>;
	release(): Promise<void>;
}
