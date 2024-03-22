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
		IF OLD.id != NEW.id THEN
			UPDATE tree
			SET parentId = NEW.id
			WHERE parentId = OLD.id;

        	UPDATE tree
			SET childId = NEW.id
				WHERE childId = OLD.id;
    	END IF;

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
				WHERE subtree.parentId = NEW.id AND supertree.childId = NEW.parentId;
    	END IF;
	END`;

const directoriesAfterDeleteTrigger = `
	CREATE OR REPLACE TRIGGER \`directories_AFTER_DELETE\` AFTER DELETE ON \`directories\` FOR EACH ROW BEGIN
		DELETE FROM tree
    	WHERE tree.childId IN
			(SELECT childId FROM (SELECT * FROM tree) AS a WHERE a.parentId = OLD.id);
	END`;

export class Migration20240116112307 extends Migration {
	async up(): Promise<void> {
		// prettier-ignore
		this.addSql('create table `directories` (`id` varchar(36) not null default UUID(), `name` varchar(255) not null, `parentId` varchar(36) null default null, `isRecycled` tinyint(1) not null default false, `createdAt` datetime not null default current_timestamp(), `updatedAt` datetime not null default current_timestamp() on update current_timestamp(), primary key (`id`)) default character set utf8mb4 engine = InnoDB;');
		// prettier-ignore
		this.addSql('alter table `directories` add index `directories_parentId_index`(`parentId`);');
		// prettier-ignore
		this.addSql('alter table `directories` add constraint `directories_parentId_foreign` foreign key (`parentId`) references `directories` (`id`) on update no action on delete no action;');

		// prettier-ignore
		this.addSql("create table `files` (`id` varchar(36) not null default UUID(), `name` varchar(255) not null, `parentId` varchar(36) null default null, `mimeType` varchar(255) not null default 'application/octet-stream', `size` bigint not null default 0, `isRecycled` tinyint(1) not null default false, `createdAt` datetime not null default current_timestamp(), `updatedAt` datetime not null default current_timestamp() on update current_timestamp(), primary key (`id`)) default character set utf8mb4 engine = InnoDB;");
		// prettier-ignore
		this.addSql('alter table `files` add index `files_parentId_index`(`parentId`);');
		// prettier-ignore
		this.addSql('alter table `files` add constraint `files_parentId_foreign` foreign key (`parentId`) references `directories` (`id`) on update no action on delete no action;');

		// prettier-ignore
		this.addSql('create table `tree` (`id` int unsigned not null auto_increment primary key, `parentId` varchar(36) null default null, `childId` varchar(36) not null, `depth` int not null default 0) default character set utf8mb4 engine = InnoDB;');
		// prettier-ignore
		this.addSql('alter table `tree` add index `tree_parentId_index`(`parentId`);');
		// prettier-ignore
		this.addSql('alter table `tree` add index `tree_childId_index`(`childId`);');
		// prettier-ignore
		this.addSql('alter table `tree` add unique `tree_parentId_childId_unique`(`parentId`, `childId`);');
		// prettier-ignore
		this.addSql('alter table `tree` add constraint `tree_parentId_foreign` foreign key (`parentId`) references `directories` (`id`) on update no action on delete no action;');
		// prettier-ignore
		this.addSql('alter table `tree` add constraint `tree_childId_foreign` foreign key (`childId`) references `directories` (`id`) on update no action on delete no action;');

		// prettier-ignore
		this.addSql('create or replace function `GET_UPMOST_DIRNAME`(`path` varchar(255)) returns varchar(255) deterministic begin if path = "" then return cast(null as varchar(255)); end if; if locate("/", path) = 0 then return path; end if; return substr(path, 1, locate("/", path) - 1); end');
		// prettier-ignore
		this.addSql('create or replace function `GET_PATH_AFTER_UPMOST_DIRNAME`(`path` varchar(255)) returns varchar(255) deterministic begin return insert(path, locate(GET_UPMOST_DIRNAME(path), path), char_length(GET_UPMOST_DIRNAME(path)) + 1, \'\'); end');
		// prettier-ignore
		this.addSql('create or replace function GET_FILE_UUID(path varchar(255)) returns varchar(255) deterministic begin declare nextPath varchar(255) default trim(leading "/" from path); declare nextUuid varchar(255) default (select id from directories where directories.name = GET_UPMOST_DIRNAME(nextPath) and directories.parentId is null); set nextPath = GET_PATH_AFTER_UPMOST_DIRNAME(nextPath); while locate("/", nextPath) != 0 do set nextUuid = (select id from directories where directories.parentId = nextUuid and directories.name = GET_UPMOST_DIRNAME(nextPath)); set nextPath = GET_PATH_AFTER_UPMOST_DIRNAME(nextPath); end while; return (select id from files where files.name = nextPath and files.parentId = nextUuid or (nextUuid is null and files.parentId is null)); end');
		// prettier-ignore
		this.addSql('CREATE OR REPLACE FUNCTION GET_FILE_PATH(id VARCHAR(255)) RETURNS varchar(255) DETERMINISTIC BEGIN DECLARE path VARCHAR(255) DEFAULT (SELECT name FROM files WHERE files.id = id); DECLARE nextUuid VARCHAR(255) DEFAULT (SELECT parentId FROM files WHERE files.id = id); WHILE nextUuid IS NOT NULL DO SET path = CONCAT((SELECT name FROM directories WHERE directories.id = nextUuid), "/", path); SET nextUuid = (SELECT parentId FROM directories WHERE directories.id = nextUuid); END WHILE; RETURN path; END');
		// prettier-ignore
		this.addSql('CREATE OR REPLACE FUNCTION GET_DIRECTORY_UUID(path VARCHAR(255)) RETURNS varchar(255) DETERMINISTIC BEGIN DECLARE nextPath VARCHAR(255) DEFAULT TRIM(LEADING "/" FROM path); DECLARE nextUuid VARCHAR(255) DEFAULT (SELECT id FROM directories WHERE name = GET_UPMOST_DIRNAME(nextPath) AND parentId IS NULL LIMIT 1); SET nextPath = GET_PATH_AFTER_UPMOST_DIRNAME(nextPath); WHILE nextPath != "" DO SET nextUuid = (SELECT id FROM directories WHERE parentId = nextUuid AND name = GET_UPMOST_DIRNAME(nextPath)); SET nextPath = GET_PATH_AFTER_UPMOST_DIRNAME(nextPath); END WHILE; RETURN nextUuid; END');
		// prettier-ignore
		this.addSql('CREATE OR REPLACE FUNCTION GET_DIRECTORY_PATH(id VARCHAR(255)) RETURNS varchar(255) DETERMINISTIC BEGIN DECLARE path VARCHAR(255) DEFAULT (SELECT name FROM directories WHERE directories.id = id); DECLARE nextUuid VARCHAR(255) DEFAULT (SELECT parentId FROM directories WHERE directories.id = id); IF id IS NULL THEN RETURN "/"; END IF; WHILE nextUuid IS NOT NULL DO SET path = CONCAT((SELECT name FROM directories WHERE directories.id = nextUuid), "/", path); SET nextUuid = (SELECT parentId FROM directories WHERE directories.id = nextUuid); END WHILE; IF path IS NULL THEN RETURN NULL; END IF; RETURN CONCAT(IF(LEFT(path, 1) = "/", "", "/"), path, IF(RIGHT(path, 1) = "/", "", "/")); END');
		// prettier-ignore
		this.addSql('CREATE OR REPLACE FUNCTION GET_DIRECTORY_SIZE(id VARCHAR(255)) RETURNS bigint(20) DETERMINISTIC BEGIN RETURN (SELECT COALESCE(SUM(size), 0) FROM files WHERE isRecycled = false AND parentId IN (SELECT childId FROM tree INNER JOIN directories ON tree.childId = directories.id WHERE directories.isRecycled = false AND tree.parentId = id)); END');

		this.addSql(directoriesAfterDeleteTrigger);
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

		this.addSql('drop function if exists `GET_UPMOST_DIRNAME`');
		this.addSql('drop function if exists `GET_PATH_AFTER_UPMOST_DIRNAME`');
		this.addSql('drop function if exists `GET_FILE_UUID`');
		this.addSql('drop function if exists `GET_FILE_PATH`');
		this.addSql('drop function if exists `GET_DIRECTORY_UUID`');
		this.addSql('drop function if exists `GET_DIRECTORY_PATH`');
		this.addSql('drop function if exists `GET_DIRECTORY_SIZE`');

		this.addSql('drop trigger if exists `directories_AFTER_INSERT`');
		this.addSql('drop trigger if exists `directories_AFTER_UPDATE`');
		this.addSql('drop trigger if exists `directories_AFTER_DELETE`');
	}
}
