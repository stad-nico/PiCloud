import { IDatabaseService } from 'src/db/DatabaseService';

export interface IRepository {
	transactional<T>(callback: () => Promise<T>): Promise<T>;
}

export abstract class Repository implements IRepository {
	protected readonly databaseService: IDatabaseService;

	protected constructor(databaseService: IDatabaseService) {
		this.databaseService = databaseService;
	}

	public async transactional<T>(callback: () => Promise<T>): Promise<T> {
		await this.databaseService.startTransaction();

		try {
			const result = await callback();

			await this.databaseService.commitTransaction();

			return result;
		} catch (e) {
			await this.databaseService.rollbackTransaction();

			throw e;
		}
	}
}
