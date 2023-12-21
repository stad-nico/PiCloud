export interface IDatabaseService {
	executePreparedStatement(query: string, params: unknown): Promise<unknown>;
	startTransaction(): Promise<void>;
	rollbackTransaction(): Promise<void>;
	commitTransaction(): Promise<void>;
}
