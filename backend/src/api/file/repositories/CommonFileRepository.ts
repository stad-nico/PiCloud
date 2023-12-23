import { IDatabaseService } from 'src/db/DatabaseService';
import { IRepository, Repository } from 'src/db/Repository';
import { File } from 'src/db/entities/File';
import { hardDeleteByUuid, selectByPathAndNotRecycled } from 'src/db/queries/File';

export interface ICommonFileRepository extends IRepository {}

export class CommonFileRepository extends Repository implements ICommonFileRepository {
	public constructor(databaseService: IDatabaseService) {
		super(databaseService);
	}

	protected map<T extends keyof File>(entity: Partial<File>, columnsToSelect: T[]): Pick<File, T> {
		let result: Pick<File, T> = {} as any;

		for (const column of columnsToSelect) {
			if (entity[column] === undefined) {
				throw new Error(`Insufficient database columns for mapping: needed ${columnsToSelect} but received ${entity}`);
			} else {
				result[column] = entity[column]!;
			}
		}

		return result;
	}

	protected async selectByPathAndNotRecycled<T extends keyof File>(path: string, columnsToSelect: T[]): Promise<Pick<File, T> | null> {
		const { query, params } = selectByPathAndNotRecycled(path, columnsToSelect);

		const result = await this.databaseService.executePreparedStatement<File>(query, params);

		if (!result) {
			return null;
		}

		return this.map(result, columnsToSelect);
	}

	protected async hardDeleteByUuid(uuid: string): Promise<void> {
		const { query, params } = hardDeleteByUuid(uuid);

		await this.databaseService.executePreparedStatement(query, params);
	}
}
