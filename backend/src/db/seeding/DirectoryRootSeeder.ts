/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { type EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Directory } from 'src/db/entities/Directory';

export class DirectoryRootSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		em.insert(Directory, { parent: null, name: 'root', id: 'root' });
	}
}
