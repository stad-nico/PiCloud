import { type EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Directory } from 'src/db/entities/Directory';

export class DirectoryRootSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		em.insert(Directory, { parent: null, name: 'root', id: 'root' });
	}
}
