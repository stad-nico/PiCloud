import { Migration } from '@mikro-orm/migrations';

export class Migration20250127195940 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `users` (`id` varchar(36) not null default UUID(), `username` varchar(255) not null, `password` varchar(255) not null, `created_at` datetime not null default current_timestamp(), primary key (`id`)) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `users` add unique `users_username_unique`(`username`);');

    this.addSql('alter table `directories` add `directory_owner` varchar(36) not null;');
    this.addSql('alter table `directories` add constraint `directories_directory_owner_foreign` foreign key (`directory_owner`) references `users` (`id`) on update cascade;');
    this.addSql('alter table `directories` add index `directories_directory_owner_index`(`directory_owner`);');

    this.addSql('alter table `files` add `file_owner` varchar(36) not null;');
    this.addSql('alter table `files` add constraint `files_file_owner_foreign` foreign key (`file_owner`) references `users` (`id`) on update cascade;');
    this.addSql('alter table `files` add index `files_file_owner_index`(`file_owner`);');
  }

  async down(): Promise<void> {
    this.addSql('alter table `directories` drop foreign key `directories_directory_owner_foreign`;');

    this.addSql('alter table `files` drop foreign key `files_file_owner_foreign`;');

    this.addSql('drop table if exists `users`;');

    this.addSql('alter table `directories` drop index `directories_directory_owner_index`;');
    this.addSql('alter table `directories` drop column `directory_owner`;');

    this.addSql('alter table `files` drop index `files_file_owner_index`;');
    this.addSql('alter table `files` drop column `file_owner`;');
  }

}
