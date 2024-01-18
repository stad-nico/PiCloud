import { EntityManager } from '@mikro-orm/mariadb';

import { File } from 'src/db/entities/File';

export const IFileRepository = Symbol('IFileRepository');

export interface IFileRepository {
	exists(entityManager: EntityManager, path: string, isRecycled?: boolean): Promise<boolean>;

	selectByPath(entityManager: EntityManager, path: string, isRecycled?: boolean): Promise<Pick<File, 'id' | 'name' | 'mimeType'> | null>;

	selectByUuid(entityManager: EntityManager, uuid: string, isRecycled?: boolean): Promise<(Pick<File, 'name'> & { path: string }) | null>;

	insertReturningUuid(entityManager: EntityManager, name: string, mimeType: string, parent?: string | null): Promise<Pick<File, 'id'>>;

	softDelete(entityManager: EntityManager, uuid: string): Promise<void>;

	getMetadata(entityManager: EntityManager, path: string): Promise<File | null>;

	update(entityManager: EntityManager, path: string, partial: Partial<File>): Promise<void>;

	restore(entityManager: EntityManager, uuid: string): Promise<void>;

	hardDelete(entityManager: EntityManager, path: string, isRecycled?: boolean): Promise<void>;
}
