import { EntityManager } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { CreateDirectoryDto } from 'src/api/directory/classes/create/CreateDirectoryDto';
import { CreateDirectoryResponse } from 'src/api/directory/classes/create/CreateDirectoryResponse';

@Injectable()
export class DirectoryService {
	private readonly entityManager: EntityManager;

	public constructor(entityManager: EntityManager) {
		this.entityManager = entityManager;
	}

	async create(createDirectoryDto: CreateDirectoryDto): Promise<CreateDirectoryResponse> {
		const m = this.entityManager.execute('f');
	}
}
