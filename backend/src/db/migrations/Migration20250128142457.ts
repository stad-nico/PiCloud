import { Migration } from '@mikro-orm/migrations';

export class Migration20250128142457 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `users` (`id` varchar(36) not null default UUID(), `username` varchar(255) not null, `password` varchar(255) not null, `createdAt` datetime not null default current_timestamp(), primary key (`id`)) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `users` add unique `users_username_unique`(`username`);');

    this.addSql('create table `directories` (`id` varchar(36) not null default UUID(), `name` varchar(255) not null, `parentId` varchar(36) null default \'root\', `createdAt` datetime not null default current_timestamp(), `updatedAt` datetime not null default current_timestamp() on update current_timestamp(), `userId` varchar(36) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `directories` add index `directories_parentId_index`(`parentId`);');
    this.addSql('alter table `directories` add index `directories_userId_index`(`userId`);');
    this.addSql('alter table `directories` add unique `directories_parentId_name_unique`(`parentId`, `name`);');

    this.addSql('create table `tree` (`id` int unsigned not null auto_increment primary key, `parentId` varchar(36) null default null, `childId` varchar(36) not null, `depth` int not null default 0) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `tree` add index `tree_parentId_index`(`parentId`);');
    this.addSql('alter table `tree` add index `tree_childId_index`(`childId`);');
    this.addSql('alter table `tree` add unique `tree_parentId_childId_unique`(`parentId`, `childId`);');

    this.addSql('create table `files` (`id` varchar(36) not null default UUID(), `name` varchar(255) not null, `parentId` varchar(36) not null default \'root\', `mimeType` varchar(255) not null default \'application/octet-stream\', `size` bigint not null default 0, `createdAt` datetime not null default current_timestamp(), `updatedAt` datetime not null default current_timestamp() on update current_timestamp(), `userId` varchar(36) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `files` add index `files_parentId_index`(`parentId`);');
    this.addSql('alter table `files` add index `files_userId_index`(`userId`);');
    this.addSql('alter table `files` add unique `files_parentId_name_unique`(`parentId`, `name`);');

    this.addSql('alter table `directories` add constraint `directories_parentId_foreign` foreign key (`parentId`) references `directories` (`id`) on update no action on delete cascade;');
    this.addSql('alter table `directories` add constraint `directories_userId_foreign` foreign key (`userId`) references `users` (`id`) on update cascade;');

    this.addSql('alter table `tree` add constraint `tree_parentId_foreign` foreign key (`parentId`) references `directories` (`id`) on update no action on delete cascade;');
    this.addSql('alter table `tree` add constraint `tree_childId_foreign` foreign key (`childId`) references `directories` (`id`) on update no action on delete cascade;');

    this.addSql('alter table `files` add constraint `files_parentId_foreign` foreign key (`parentId`) references `directories` (`id`) on update no action on delete cascade;');
    this.addSql('alter table `files` add constraint `files_userId_foreign` foreign key (`userId`) references `users` (`id`) on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `directories` drop foreign key `directories_userId_foreign`;');

    this.addSql('alter table `files` drop foreign key `files_userId_foreign`;');

    this.addSql('alter table `directories` drop foreign key `directories_parentId_foreign`;');

    this.addSql('alter table `tree` drop foreign key `tree_parentId_foreign`;');

    this.addSql('alter table `tree` drop foreign key `tree_childId_foreign`;');

    this.addSql('alter table `files` drop foreign key `files_parentId_foreign`;');

    this.addSql('drop table if exists `users`;');

    this.addSql('drop table if exists `directories`;');

    this.addSql('drop table if exists `tree`;');

    this.addSql('drop table if exists `files`;');
  }

}
