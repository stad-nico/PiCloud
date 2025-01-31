/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { EntityRepository } from '@mikro-orm/mariadb';
import { File } from 'src/db/entities/file.entity';

export class FileRepository extends EntityRepository<File> {}
