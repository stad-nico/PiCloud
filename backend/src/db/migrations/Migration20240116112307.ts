import { Migration } from '@mikro-orm/migrations';

export class Migration20240116112307 extends Migration {
	async up(): Promise<void> {
		// prettier-ignore
		this.addSql('create table `directories` (`id` varchar(36) not null default UUID(), `name` varchar(255) not null, `parent_id` varchar(36) null, `is_recycled` tinyint null default false, `created_at` datetime not null default current_timestamp(), `updated_at` datetime not null default current_timestamp() on update current_timestamp(), primary key (`id`)) default character set utf8mb4 engine = InnoDB;');
		// prettier-ignore
		this.addSql('alter table `directories` add index `directories_parent_id_index`(`parent_id`);');
		// prettier-ignore
		this.addSql('alter table `directories` add constraint `directories_parent_id_foreign` foreign key (`parent_id`) references `directories` (`id`) on update no action on delete no action;');

		// prettier-ignore
		this.addSql("create table `files` (`id` varchar(36) not null default UUID(), `name` varchar(255) not null, `parent_id` varchar(36) null, `mime_type` varchar(255) not null default 'application/octet-stream', `size` bigint not null default 0, `is_recycled` tinyint(1) not null default false, `created` datetime not null default CURRENT_TIMESTAMP(), `updated` datetime not null default CURRENT_TIMESTAMP(), primary key (`id`)) default character set utf8mb4 engine = InnoDB;");
		// prettier-ignore
		this.addSql('alter table `files` add index `files_parent_id_index`(`parent_id`);');
		// prettier-ignore
		this.addSql('alter table `files` add constraint `files_parent_id_foreign` foreign key (`parent_id`) references `directories` (`id`) on update no action on delete no action;');

		// prettier-ignore
		this.addSql('create table `tree` (`id` int unsigned not null auto_increment primary key, `parent_id` varchar(255) null default null, `child_id` varchar(255) not null, `depth` int not null default 0) default character set utf8mb4 engine = InnoDB;');
		// prettier-ignore
		this.addSql('alter table `tree` add unique `tree_parent_id_child_id_unique`(`parent_id`, `child_id`);');

		// prettier-ignore
		this.addSql('create or replace function `GET_UPMOST_DIRNAME`(`path` varchar(255)) returns varchar(255) deterministic begin if path = "" then return cast(null as varchar(255)); end if; if locate("/", path) = 0 then return path; end if; return substr(path, 1, locate("/", path) - 1); end');
	}

	async down(): Promise<void> {
		// prettier-ignore
		this.addSql('alter table `directories` drop foreign key `directories_parent_id_foreign`;');

		// prettier-ignore
		this.addSql('alter table `files` drop foreign key `files_parent_id_foreign`;');

		// prettier-ignore
		this.addSql('drop table if exists `directories`;');

		// prettier-ignore
		this.addSql('drop table if exists `files`;');

		// prettier-ignore
		this.addSql('drop table if exists `tree`;');
	}
}
