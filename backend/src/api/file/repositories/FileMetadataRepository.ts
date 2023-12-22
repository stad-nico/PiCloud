import { Injectable } from '@nestjs/common';
import { CommonFileRepository, ICommonFileRepository } from 'src/api/file/repositories/CommonFileRepository';
import { File } from 'src/db/entities/File';

export const IFileMetadataRepository = Symbol('IFileMetadataRepository');

export interface IFileMetadataRepository extends ICommonFileRepository {
	getFullByPathAndNotRecycled(path: string): Promise<File>;
}

@Injectable()
export class FileMetadataRepository extends CommonFileRepository implements IFileMetadataRepository {
	public async getFullByPathAndNotRecycled(path: string): Promise<File> {
		return super.selectByPathAndNotRecycled(path, ['uuid', 'name', 'parent', 'size', 'isRecycled', 'created', 'updated', 'mimeType']);
	}
}
