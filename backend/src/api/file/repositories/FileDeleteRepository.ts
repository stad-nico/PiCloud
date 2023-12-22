import { Injectable } from '@nestjs/common';
import { CommonFileRepository, ICommonFileRepository } from 'src/api/file/repositories/CommonFileRepository';
import { File } from 'src/db/entities/File';

export interface IFileDeleteRepository extends ICommonFileRepository {
	getUuidByPathAndNotRecycled(path: string): Promise<Pick<File, 'uuid'>>;
	softDelete(uuid: string): Promise<void>;
}

@Injectable()
export class FileDeleteRepository extends CommonFileRepository implements IFileDeleteRepository {
	public async getUuidByPathAndNotRecycled(path: string): Promise<Pick<File, 'uuid'>> {
		return super.selectByPathAndColumns(path, { isRecycled: false }, ['uuid']);
	}

	public async softDelete(uuid: string): Promise<void> {}
}
