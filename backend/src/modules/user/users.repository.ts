import { EntityRepository } from '@mikro-orm/mariadb';
import { User } from 'src/db/entities/user.entitiy';

export class UserRepository extends EntityRepository<User> {}
