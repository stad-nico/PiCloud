/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Migration } from '@mikro-orm/migrations';

const directoriesAfterInsertTrigger = `
	CREATE OR REPLACE TRIGGER \`directories_AFTER_INSERT\` AFTER INSERT ON \`directories\`
	FOR EACH ROW BEGIN
		# create first flat entry (self, self, 0)
		INSERT INTO tree (parentId, childId, depth)
		SELECT NEW.id, NEW.id, 0;

    	# create hierarchical entries
    	# depends on flat entries - must be a separate insert
    	INSERT INTO tree (parentId, childId, depth)
    	SELECT p.parentId, c.childId, p.depth + c.depth + 1
    	FROM tree p JOIN tree c
    	WHERE p.childId = NEW.parentId AND c.parentId = NEW.id;
	END`;

const directoriesAfterUpdateTrigger = `
	CREATE OR REPLACE TRIGGER \`directories_AFTER_UPDATE\` AFTER UPDATE ON \`directories\` FOR EACH ROW BEGIN
    	IF OLD.parentId != NEW.parentId THEN
			# remove all paths to subtree but not paths inside the subtree
			DELETE FROM tree
			WHERE tree.childId IN
				(SELECT childId FROM (SELECT * FROM tree) AS a WHERE a.parentId = NEW.id)
            AND tree.parentId NOT IN
				(SELECT childId FROM (SELECT * FROM tree) AS b WHERE b.parentId = NEW.id);

			INSERT INTO tree (parentId, childId, depth)
				SELECT supertree.parentId, subtree.childId, supertree.depth + subtree.depth + 1
				FROM tree AS supertree JOIN tree AS subtree
				WHERE subtree.parentId = NEW.id AND supertree.childId = NEW.parentId
			ON DUPLICATE KEY UPDATE parentId = supertree.parentId, childId = subtree.childId, depth = supertree.depth + subtree.depth + 1;
    	END IF;
	END`;

export class Migration20240116112307 extends Migration {
	async up(): Promise<void> {
		// prettier-ignore
		this.addSql('create table `directories` (`id` varchar(36) not null default UUID(), `name` varchar(255) not null, `parentId` varchar(36) null default "root", `createdAt` datetime not null default current_timestamp(), `updatedAt` datetime not null default current_timestamp() on update current_timestamp(), primary key (`id`)) default character set utf8mb4 engine = InnoDB;');
		// prettier-ignore
		this.addSql('alter table `directories` add index `directories_parentId_index`(`parentId`);');
		// prettier-ignore
		this.addSql('alter table `directories` add unique `directories_parentId_name_unique`(`parentId`, `name`);');
		// prettier-ignore
		this.addSql('alter table `directories` add constraint `directories_parentId_foreign` foreign key (`parentId`) references `directories` (`id`) on update no action on delete cascade;');

		// prettier-ignore
		this.addSql("create table `files` (`id` varchar(36) not null default UUID(), `name` varchar(255) not null, `parentId` varchar(36) not null default 'root', `mimeType` varchar(255) not null default 'application/octet-stream', `size` bigint not null default 0, `createdAt` datetime not null default current_timestamp(), `updatedAt` datetime not null default current_timestamp() on update current_timestamp(), primary key (`id`)) default character set utf8mb4 engine = InnoDB;");
		// prettier-ignore
		this.addSql('alter table `files` add index `files_parentId_index`(`parentId`);');
		// prettier-ignore
		this.addSql('alter table `files` add unique `files_parentId_name_unique`(`parentId`, `name`);');
		// prettier-ignore
		this.addSql('alter table `files` add constraint `files_parentId_foreign` foreign key (`parentId`) references `directories` (`id`) on update no action on delete cascade;');

		// prettier-ignore
		this.addSql('create table `tree` (`id` int unsigned not null auto_increment primary key, `parentId` varchar(36) null default null, `childId` varchar(36) not null, `depth` int not null default 0) default character set utf8mb4 engine = InnoDB;');
		// prettier-ignore
		this.addSql('alter table `tree` add index `tree_parentId_index`(`parentId`);');
		// prettier-ignore
		this.addSql('alter table `tree` add index `tree_childId_index`(`childId`);');
		// prettier-ignore
		this.addSql('alter table `tree` add unique `tree_parentId_childId_unique`(`parentId`, `childId`);');
		// prettier-ignore
		this.addSql('alter table `tree` add constraint `tree_parentId_foreign` foreign key (`parentId`) references `directories` (`id`) on update no action on delete cascade;');
		// prettier-ignore
		this.addSql('alter table `tree` add constraint `tree_childId_foreign` foreign key (`childId`) references `directories` (`id`) on update no action on delete cascade;');

		this.addSql(directoriesAfterInsertTrigger);
		this.addSql(directoriesAfterUpdateTrigger);
	}

	async down(): Promise<void> {
		this.addSql('alter table `directories` drop foreign key `directories_parentId_foreign`;');
		this.addSql('alter table `files` drop foreign key `files_parentId_foreign`;');
		this.addSql('alter table `tree` drop foreign key `tree_parentId_foreign`;');
		this.addSql('alter table `tree` drop foreign key `tree_childId_foreign`;');

		this.addSql('drop table if exists `directories`;');
		this.addSql('drop table if exists `files`;');
		this.addSql('drop table if exists `tree`;');

		this.addSql('drop trigger if exists `directories_AFTER_INSERT`');
		this.addSql('drop trigger if exists `directories_AFTER_UPDATE`');
	}
}
