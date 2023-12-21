import { Injectable } from '@nestjs/common';
import { CommonFileRepository, ICommonFileRepository } from 'src/api/file/repositories/CommonFileRepository';

export interface IFileMetadataRepository extends ICommonFileRepository {
	getFullByPathAndNotRecycled(path: string): Promise<unknown>;
}

@Injectable()
export class FileMetadataRepository extends CommonFileRepository implements IFileMetadataRepository {
	public async getFullByPathAndNotRecycled(path: string): Promise<unknown> {
		return super.selectByPathAndColumns(path, { isRecycled: false }, ['*']);
	}
}
