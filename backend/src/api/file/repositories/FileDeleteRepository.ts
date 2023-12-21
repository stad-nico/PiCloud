import { Injectable } from '@nestjs/common';
import { CommonFileRepository, ICommonFileRepository } from 'src/api/file/repositories/CommonFileRepository';

export interface IFileDeleteRepository extends ICommonFileRepository {
	getUuidByPathAndNotRecycled(path: string): Promise<{ uuid: string }>;
	softDelete(uuid: string): Promise<void>;
}

@Injectable()
export class FileDeleteRepository extends CommonFileRepository implements IFileDeleteRepository {
	public async getUuidByPathAndNotRecycled(path: string): Promise<{ uuid: string }> {
		return super.selectByPathAndColumns(path, { isRecycled: false }, ['uuid']) as any;
	}

	public async softDelete(uuid: string): Promise<void> {}
}
