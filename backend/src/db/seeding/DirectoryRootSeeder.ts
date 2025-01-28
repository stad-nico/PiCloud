/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { type EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Directory, ROOT_ID } from 'src/db/entities/directory.entity';

export class DirectoryRootSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		em.insert(Directory, {
			parent: null, name: ROOT_ID, id: ROOT_ID,
			directory_owner: ''
		});
	}
}
