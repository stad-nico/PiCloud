import { IDatabaseService } from 'src/db/DatabaseService';
import { IRepository, Repository } from 'src/db/Repository';
import { File } from 'src/db/entities/File';

export interface ICommonFileRepository extends IRepository {}

export class CommonFileRepository extends Repository implements ICommonFileRepository {
	public constructor(databaseService: IDatabaseService) {
		super(databaseService);
	}
	// protected selectByColumns(columns: Record<string, unknown>, columnsToSelect: string[]): Promise<unknown> {
	// 	throw new Error('Method not implemented.');
	// }

	public async selectByPathAndColumns<T extends keyof File>(
		path: string,
		columns: Record<string, unknown>,
		columnsToSelect: T[]
	): Promise<Pick<File, T>> {}

	protected async hardDeleteByUuid(uuid: string): Promise<void> {
		this.databaseService.executePreparedStatement('DELETE FROM files WHERE uuid = :uuid', { uuid: uuid });
	}

	// protected async selectByPath(path: string, columns: unknown): Promise<unknown> {
	// 	throw new Error('Method not implemented.');
	// }
}

const m = await new CommonFileRepository(0 as any).selectByPathAndColumns('fff', {}, ['created', 'uuid']);
