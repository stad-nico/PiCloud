import { EntityManager } from '@mikro-orm/mariadb';
import { Injectable } from '@nestjs/common';
import { User } from 'src/db/entities/user.entitiy';

@Injectable()
export class UsersRepository {
	public async findOneByUsername(entityManager: EntityManager, username: string): Promise<User | null> {
		return await entityManager.findOne(User, { username });
	}

	public async findOneById(entityManager: EntityManager, id: string): Promise<User | null> {
		return await entityManager.findOne(User, { id });
	}
}
