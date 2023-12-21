import { Injectable } from '@nestjs/common';
import { CommonFileRepository, ICommonFileRepository } from 'src/api/file/repositories/CommonFileRepository';

export interface IFileRenameRepository extends ICommonFileRepository {
	selectSizeAndUuidByPathAndNotRecycled(path: string): Promise<{ uuid: string; size: string }>;
	getUuidByPathAndNotRecycled(path: string): Promise<{ uuid: string }>;
	hardDeleteByUuid(uuid: string): Promise<void>;
}

@Injectable()
export class FileRenameRepository extends CommonFileRepository implements IFileRenameRepository {
	public async selectSizeAndUuidByPathAndNotRecycled(path: string): Promise<{ uuid: string; size: string }> {
		return super.selectByPathAndColumns(path, { isRecycled: false }, ['uuid', 'size']) as any;
	}

	public async getUuidByPathAndNotRecycled(path: string): Promise<{ uuid: string }> {
		return super.selectByPathAndColumns(path, { isRecycled: false }, ['uuid']) as any;
	}

	public override async hardDeleteByUuid(uuid: string): Promise<void> {
		return super.hardDeleteByUuid(uuid);
	}
}
