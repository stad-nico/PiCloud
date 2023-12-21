import { Injectable } from '@nestjs/common';
import { CommonFileRepository, ICommonFileRepository } from 'src/api/file/repositories/CommonFileRepository';

export interface IFileDownloadRepository extends ICommonFileRepository {
	getByPathAndNotRecycled(path: string): Promise<{ uuid: string; name: string; mimeType: string }>;
}

@Injectable()
export class FileDownloadRepository extends CommonFileRepository implements IFileDownloadRepository {
	public async getByPathAndNotRecycled(path: string): Promise<{ uuid: string; name: string; mimeType: string }> {
		return super.selectByPathAndColumns(path, { isRecycled: false }, ['uuid', 'name', 'size']) as any;
	}
}
