/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { EntityRepository, raw } from '@mikro-orm/mariadb';
import { Directory } from 'src/db/entities/directory.entity';
import { File } from 'src/db/entities/file.entity';
import { Tree } from 'src/db/entities/tree.entity';
import { DirectoryContentDirectory } from 'src/modules/directories/mapping/content/DirectoryContentResponse';

export type DirectoryMetadata = Pick<Directory, 'id' | 'name' | 'createdAt' | 'updatedAt'> & {
	size: number;
	files: number;
	directories: number;
	parentId: string | null;
	userId: string;
};

export class DirectoryRepository extends EntityRepository<Directory> {
	public async getContents(directory: Directory): Promise<Array<DirectoryContentDirectory>> {
		const childDirectories = this.em
			.createQueryBuilder(Tree)
			.select('child')
			.where({ parent: raw('d.id') });

		const hasSubdirectories = this.createQueryBuilder()
			.count()
			.where({ id: { $in: childDirectories.getKnexQuery() } });

		const size = this.em
			.createQueryBuilder(File)
			.select(raw('COALESCE(SUM(size), 0)'))
			.where({ parent: { id: { $in: childDirectories.getKnexQuery() } } });

		const queryBuilder = this.createQueryBuilder('d')
			.select(['id', 'name', 'updatedAt', 'createdAt', hasSubdirectories.as('hasSubdirectories'), size.as('size')])
			.where({ parent: directory.id, user: directory.user });

		const rawDirectories = (await queryBuilder.execute()) as Array<{
			id: string;
			name: string;
			updatedAt: string;
			createdAt: string;
			size: number;
			hasSubdirectories: number;
		}>;

		return rawDirectories.map((directory) => ({
			id: directory.id,
			name: directory.name,
			createdAt: new Date(Date.parse(directory.createdAt)),
			updatedAt: new Date(Date.parse(directory.updatedAt)),
			size: directory.size,
			hasSubdirectories: directory.hasSubdirectories > 1,
		}));
	}

	public async getMetadata(directory: Directory): Promise<DirectoryMetadata> {
		const childDirectories = this.em
			.createQueryBuilder(Tree)
			.select('child')
			.where({ parent: raw('d.id') });

		const directoriesCount = this.createQueryBuilder()
			.count()
			.where({ id: { $in: childDirectories.getKnexQuery() } });

		const filesCount = this.em
			.createQueryBuilder(File)
			.count()
			.where({ parent: { id: { $in: childDirectories.getKnexQuery() } } });

		const size = this.em
			.createQueryBuilder(File)
			.select(raw('COALESCE(SUM(size), 0)'))
			.where({ parent: { id: { $in: childDirectories.getKnexQuery() } } });

		const queryBuilder = this.createQueryBuilder('d')
			.select([
				'id',
				'name',
				'updatedAt',
				'createdAt',
				'parent',
				'user',
				filesCount.as('files'),
				directoriesCount.as('directories'),
				size.as('size'),
			])
			.where({ id: directory.id, user: directory.user });

		const rawMetadata = (await queryBuilder.execute('get')) as {
			id: string;
			name: string;
			parent: null | string;
			createdAt: string;
			updatedAt: string;
			user: string;
			files: number;
			directories: number;
			size: number;
		};

		return {
			id: rawMetadata.id,
			name: rawMetadata.name,
			parentId: rawMetadata.parent,
			updatedAt: new Date(Date.parse(rawMetadata.updatedAt)),
			createdAt: new Date(Date.parse(rawMetadata.createdAt)),
			userId: rawMetadata.user,
			size: rawMetadata.size,
			files: rawMetadata.files,
			directories: rawMetadata.directories - 1,
		};
	}

	public async getContentsRecursive(directory: Directory): Promise<{ files: Array<File>; directories: Array<Directory> }> {
		const childDirectories = this.em.createQueryBuilder(Tree).select('child').where({ parent: directory });

		const files = await this.em
			.createQueryBuilder(File)
			.select(['id', 'name', 'parent'])
			.where({ parent: { id: { $in: childDirectories.getKnexQuery() } } })
			.getResult();

		const directories = await this.createQueryBuilder()
			.select(['id', 'name', 'parent'])
			.where({ id: { $in: childDirectories.getKnexQuery() } });

		return { files, directories };
	}
}
