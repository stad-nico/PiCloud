import { Injectable } from '@nestjs/common';
import { CommonFileRepository, ICommonFileRepository } from 'src/api/file/repositories/CommonFileRepository';
import { File } from 'src/db/entities/File';

export const IFileMetadataRepository = Symbol('IFileMetadataRepository');

export interface IFileMetadataRepository extends ICommonFileRepository {
	getFullEntityByPathAndNotRecycled(path: string): Promise<File | null>;
}

@Injectable()
export class FileMetadataRepository extends CommonFileRepository implements IFileMetadataRepository {
	public async getFullEntityByPathAndNotRecycled(path: string): Promise<File | null> {
		return super.selectByPathAndNotRecycled(path, ['uuid', 'name', 'parent', 'size', 'isRecycled', 'created', 'updated', 'mimeType']);
	}
}
