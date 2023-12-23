import { QueryBundle } from 'src/db/queries/File';

export type TransactionalConnection = Connection & {
	startTransaction(): Promise<void>;
	commitTransaction(): Promise<void>;
	rollbackTransaction(): Promise<void>;
	release(): Promise<void>;
};

export type Connection = {
	executePreparedStatement(queryBundle: QueryBundle): any;
};
