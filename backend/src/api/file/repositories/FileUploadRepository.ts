import { Injectable } from '@nestjs/common';
import { CommonFileRepository, ICommonFileRepository } from 'src/api/file/repositories/CommonFileRepository';

export interface IFileUploadRepository extends ICommonFileRepository {
	getUuidByPathAndNotRecycled(path: string): Promise<{ uuid: string }>;
	hardDeleteByUuid(uuid: string): Promise<void>;
	insertAndSelectUuidAndPath(file: unknown): Promise<{ uuid: string; path: string }>;
}

@Injectable()
export class FileUploadRepository extends CommonFileRepository implements IFileUploadRepository {
	public async getUuidByPathAndNotRecycled(path: string): Promise<{ uuid: string }> {
		return super.selectByPathAndColumns(path, { isRecycled: false }, ['uuid']) as any;
	}

	public override async hardDeleteByUuid(uuid: string): Promise<void> {
		return super.hardDeleteByUuid(uuid);
	}

	public async insertAndSelectUuidAndPath(file: unknown): Promise<{ uuid: string; path: string }> {
		return 0 as any;
	}
}
