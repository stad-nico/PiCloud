import { Injectable } from '@nestjs/common';
import { CommonFileRepository, ICommonFileRepository } from 'src/api/file/repositories/CommonFileRepository';
import { File } from 'src/db/entities/File';

export const IFileRenameRepository = Symbol('IFileRenameRepository');

export interface IFileRenameRepository extends ICommonFileRepository {
	selectSizeAndUuidByPathAndNotRecycled(path: string): Promise<Pick<File, 'uuid' | 'size'>>;
	getUuidByPathAndNotRecycled(path: string): Promise<Pick<File, 'uuid'>>;
	hardDeleteByUuid(uuid: string): Promise<void>;
}

@Injectable()
export class FileRenameRepository extends CommonFileRepository implements IFileRenameRepository {
	public async selectSizeAndUuidByPathAndNotRecycled(path: string): Promise<Pick<File, 'uuid' | 'size'>> {
		return super.selectByPathAndNotRecycled(path, ['uuid', 'size']);
	}

	public async getUuidByPathAndNotRecycled(path: string): Promise<Pick<File, 'uuid'>> {
		return super.selectByPathAndNotRecycled(path, ['uuid']);
	}

	public override async hardDeleteByUuid(uuid: string): Promise<void> {
		return super.hardDeleteByUuid(uuid);
	}
}
