export interface IDatabaseService {
	executePreparedStatement(query: string, params: Record<string, string | boolean | number>): Promise<unknown>;
	startTransaction(): Promise<void>;
	rollbackTransaction(): Promise<void>;
	commitTransaction(): Promise<void>;
}
