import { IRepository, Repository } from 'src/db/Repository';

export interface ICommonFileRepository extends IRepository {}

export class CommonFileRepository extends Repository implements ICommonFileRepository {
	// protected selectByColumns(columns: Record<string, unknown>, columnsToSelect: string[]): Promise<unknown> {
	// 	throw new Error('Method not implemented.');
	// }

	protected async selectByPathAndColumns(path: string, columns: Record<string, unknown>, columnsToSelect: string[]): Promise<unknown> {
		throw new Error('Method not implemented.');
	}

	protected async hardDeleteByUuid(uuid: string): Promise<void> {
		throw new Error('Method not implemented.');
	}

	// protected async selectByPath(path: string, columns: unknown): Promise<unknown> {
	// 	throw new Error('Method not implemented.');
	// }
}
