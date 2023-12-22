import { Injectable } from '@nestjs/common';
import { CommonFileRepository, ICommonFileRepository } from 'src/api/file/repositories/CommonFileRepository';
import { File } from 'src/db/entities/File';

export const IFileDownloadRepository = Symbol('IFileDownloadRepository');

export interface IFileDownloadRepository extends ICommonFileRepository {
	getByPathAndNotRecycled(path: string): Promise<Pick<File, 'uuid' | 'name' | 'mimeType'>>;
}

@Injectable()
export class FileDownloadRepository extends CommonFileRepository implements IFileDownloadRepository {
	public async getByPathAndNotRecycled(path: string): Promise<Pick<File, 'uuid' | 'name' | 'mimeType'>> {
		return super.selectByPathAndNotRecycled(path, ['uuid', 'name', 'mimeType']);
	}
}
