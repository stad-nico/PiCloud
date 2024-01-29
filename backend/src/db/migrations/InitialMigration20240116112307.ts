import { Migration } from '@mikro-orm/migrations';

const directoriesAfterInsertTrigger = `
	CREATE OR REPLACE TRIGGER \`directories_AFTER_INSERT\` AFTER INSERT ON \`directories\`
	FOR EACH ROW BEGIN
		# create first flat entry (self, self, 0)
		INSERT INTO tree (parent_id, child_id, depth)
		SELECT NEW.id, NEW.id, 0;

    	# create hierarchical entries
    	# depends on flat entries - must be a seperate insert
    	INSERT INTO tree (parent_id, child_id, depth)
    	SELECT p.parent_id, c.child_id, p.depth + c.depth + 1
    	FROM tree p JOIN tree c
    	WHERE p.child_id = NEW.parent_id AND c.parent_id = NEW.id;
	END`;

const directoriesAfterUpdateTrigger = `
	CREATE OR REPLACE TRIGGER \`directories_AFTER_UPDATE\` AFTER UPDATE ON \`directories\` FOR EACH ROW BEGIN
		IF OLD.id != NEW.id THEN
			UPDATE tree
			SET parent_id = NEW.id
			WHERE parent_id = OLD.id;

        	UPDATE tree
			SET child_id = NEW.id
				WHERE child_id = OLD.id;
    	END IF;

    	IF OLD.parent_id != NEW.parent_id THEN
			# remove all paths to subtree but not paths inside the subtree
			DELETE FROM tree
			WHERE tree.child_id IN
				(SELECT child_id FROM (SELECT * FROM tree) AS a WHERE a.parent_id = NEW.id)
            AND tree.parent_id NOT IN
				(SELECT child_id FROM (SELECT * FROM tree) AS b WHERE b.parent_id = NEW.id);

			INSERT INTO tree (parent_id, child_id, depth)
				SELECT supertree.parent_id, subtree.child_id, supertree.depth + subtree.depth + 1
				FROM tree AS supertree JOIN tree AS subtree
				WHERE subtree.parent_id = NEW.id AND supertree.child_id = NEW.parent_id;
    	END IF;
	END`;

const directoriesAfterDeleteTrigger = `
	CREATE OR REPLACE TRIGGER \`directories_AFTER_DELETE\` AFTER DELETE ON \`directories\` FOR EACH ROW BEGIN
		DELETE FROM tree
    	WHERE tree.child_id IN
			(SELECT child_id FROM (SELECT * FROM tree) AS a WHERE a.parent_id = OLD.id);
	END`;

const filesAfterInsertTrigger = `
	CREATE OR REPLACE TRIGGER \`files_AFTER_INSERT\` AFTER INSERT ON \`files\` FOR EACH ROW BEGIN
		INSERT INTO tree (parent_id, child_id, depth)
    	SELECT parent_id, NEW.id, depth + 1
      	FROM tree
      	WHERE child_id = NEW.parent_id;
	END`;

const filesAfterUpdateTrigger = `
	CREATE OR REPLACE TRIGGER \`files_AFTER_UPDATE\` AFTER UPDATE ON \`files\` FOR EACH ROW BEGIN
		IF OLD.id != NEW.id THEN
			UPDATE tree SET child_id = NEW.id WHERE child_id = OLD.id;
    	END IF;

    	IF OLD.parent_id != NEW.parent_id THEN
			UPDATE tree SET parent_id = NEW.parent_id WHERE child_id = OLD.id AND parent_id = OLD.parent_id;
    	END IF;
	END`;

const filesAfterDeleteTrigger = `
	CREATE OR REPLACE TRIGGER \`files_AFTER_DELETE\` AFTER DELETE ON \`files\` FOR EACH ROW BEGIN
		DELETE FROM tree
    	WHERE child_id = OLD.id;
	END`;

export class Migration20240116112307 extends Migration {
	async up(): Promise<void> {
		// prettier-ignore
		this.addSql('create table `directories` (`id` varchar(36) not null default UUID(), `name` varchar(255) not null, `parent_id` varchar(36) null default null, `is_recycled` tinyint(1) not null default false, `created_at` datetime not null default current_timestamp(), `updated_at` datetime not null default current_timestamp() on update current_timestamp(), primary key (`id`)) default character set utf8mb4 engine = InnoDB;');
		// prettier-ignore
		this.addSql('alter table `directories` add index `directories_parent_id_index`(`parent_id`);');
		// prettier-ignore
		this.addSql('alter table `directories` add constraint `directories_parent_id_foreign` foreign key (`parent_id`) references `directories` (`id`) on update no action on delete no action;');

		// prettier-ignore
		this.addSql("create table `files` (`id` varchar(36) not null default UUID(), `name` varchar(255) not null, `parent_id` varchar(36) null default null, `mime_type` varchar(255) not null default 'application/octet-stream', `size` bigint not null default 0, `is_recycled` tinyint(1) not null default false, `created_at` datetime not null default current_timestamp(), `updated_at` datetime not null default current_timestamp() on update current_timestamp(), primary key (`id`)) default character set utf8mb4 engine = InnoDB;");
		// prettier-ignore
		this.addSql('alter table `files` add index `files_parent_id_index`(`parent_id`);');
		// prettier-ignore
		this.addSql('alter table `files` add constraint `files_parent_id_foreign` foreign key (`parent_id`) references `directories` (`id`) on update no action on delete no action;');

		// prettier-ignore
		this.addSql('create table `tree` (`id` int unsigned not null auto_increment primary key, `parent_id` varchar(36) null default null, `child_id` varchar(36) not null, `depth` int not null default 0) default character set utf8mb4 engine = InnoDB;');
		// prettier-ignore
		this.addSql('alter table `tree` add index `tree_parent_id_index`(`parent_id`);');
		// prettier-ignore
		this.addSql('alter table `tree` add index `tree_child_id_index`(`child_id`);');
		// prettier-ignore
		this.addSql('alter table `tree` add unique `tree_parent_id_child_id_unique`(`parent_id`, `child_id`);');
		// prettier-ignore
		this.addSql('alter table `tree` add constraint `tree_parent_id_foreign` foreign key (`parent_id`) references `directories` (`id`) on update no action on delete no action;');
		// prettier-ignore
		this.addSql('alter table `tree` add constraint `tree_child_id_foreign` foreign key (`child_id`) references `directories` (`id`) on update no action on delete no action;');

		// prettier-ignore
		this.addSql('create or replace function `GET_UPMOST_DIRNAME`(`path` varchar(255)) returns varchar(255) deterministic begin if path = "" then return cast(null as varchar(255)); end if; if locate("/", path) = 0 then return path; end if; return substr(path, 1, locate("/", path) - 1); end');
		// prettier-ignore
		this.addSql('create or replace function `GET_PATH_AFTER_UPMOST_DIRNAME`(`path` varchar(255)) returns varchar(255) deterministic begin return insert(path, locate(GET_UPMOST_DIRNAME(path), path), char_length(GET_UPMOST_DIRNAME(path)) + 1, \'\'); end');
		// prettier-ignore
		this.addSql('create or replace function GET_FILE_UUID(path varchar(255)) returns varchar(255) deterministic begin declare nextPath varchar(255) default trim(leading "/" from path); declare nextUuid varchar(255) default (select id from directories where directories.name = GET_UPMOST_DIRNAME(nextPath) and directories.parent_id is null); set nextPath = GET_PATH_AFTER_UPMOST_DIRNAME(nextPath); while locate("/", nextPath) != 0 do set nextUuid = (select id from directories where directories.parent_id = nextUuid and directories.name = GET_UPMOST_DIRNAME(nextPath)); set nextPath = GET_PATH_AFTER_UPMOST_DIRNAME(nextPath); end while; return (select id from files where files.name = nextPath and files.parent_id = nextUuid or (nextUuid is null and files.parent_id is null)); end');
		// prettier-ignore
		this.addSql('CREATE OR REPLACE FUNCTION GET_FILE_PATH(id VARCHAR(255)) RETURNS varchar(255) DETERMINISTIC BEGIN DECLARE path VARCHAR(255) DEFAULT (SELECT name FROM files WHERE files.id = id); DECLARE nextUuid VARCHAR(255) DEFAULT (SELECT parent_id FROM files WHERE files.id = id); WHILE nextUuid IS NOT NULL DO SET path = CONCAT((SELECT name FROM directories WHERE directories.id = nextUuid), "/", path); SET nextUuid = (SELECT parent_id FROM directories WHERE directories.id = nextUuid); END WHILE; RETURN path; END')
		// prettier-ignore
		this.addSql('CREATE OR REPLACE FUNCTION GET_DIRECTORY_UUID(path VARCHAR(255)) RETURNS varchar(255) DETERMINISTIC BEGIN DECLARE nextPath VARCHAR(255) DEFAULT TRIM(LEADING "/" FROM path); DECLARE nextUuid VARCHAR(255) DEFAULT (SELECT id FROM directories WHERE directories.name = GET_UPMOST_DIRNAME(nextPath) AND directories.parent_id IS NULL); SET nextPath = GET_PATH_AFTER_UPMOST_DIRNAME(nextPath); WHILE nextPath != "" DO SET nextUuid = (SELECT id FROM directories WHERE directories.parent_id = nextUuid AND directories.name = GET_UPMOST_DIRNAME(nextPath)); SET nextPath = GET_PATH_AFTER_UPMOST_DIRNAME(nextPath); END WHILE; RETURN nextUuid; END')
		// prettier-ignore
		this.addSql('CREATE OR REPLACE FUNCTION GET_DIRECTORY_PATH(id VARCHAR(255)) RETURNS varchar(255) DETERMINISTIC BEGIN DECLARE path VARCHAR(255) DEFAULT (SELECT name FROM directories WHERE directories.id = id); DECLARE nextUuid VARCHAR(255) DEFAULT (SELECT parent_id FROM directories WHERE directories.id = id); IF id IS NULL THEN RETURN "/"; END IF; WHILE nextUuid IS NOT NULL DO SET path = CONCAT((SELECT name FROM directories WHERE directories.id = nextUuid), "/", path); SET nextUuid = (SELECT parent_id FROM directories WHERE directories.id = nextUuid); END WHILE; RETURN path; END')
		// prettier-ignore
		this.addSql('CREATE OR REPLACE FUNCTION GET_DIRECTORY_SIZE(id VARCHAR(255)) RETURNS bigint(20) DETERMINISTIC BEGIN RETURN (SELECT COALESCE(SUM(size),0) AS size FROM tree INNER JOIN files ON tree.child_id = files.id WHERE tree.parent_id = id AND files.is_recycled = false); END');

		// this.addSql(filesAfterDeleteTrigger);
		// this.addSql(filesAfterInsertTrigger);
		// this.addSql(filesAfterUpdateTrigger);
		this.addSql(directoriesAfterDeleteTrigger);
		this.addSql(directoriesAfterInsertTrigger);
		this.addSql(directoriesAfterUpdateTrigger);
	}

	async down(): Promise<void> {
		this.addSql('alter table `directories` drop foreign key `directories_parent_id_foreign`;');
		this.addSql('alter table `files` drop foreign key `files_parent_id_foreign`;');
		this.addSql('alter table `tree` drop foreign key `tree_parent_id_foreign`;');
		this.addSql('alter table `tree` drop foreign key `tree_child_id_foreign`;');
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

		// this.addSql('drop trigger if exists `files_AFTER_INSERT`');
		// this.addSql('drop trigger if exists `files_AFTER_DELETE`');
		// this.addSql('drop trigger if exists `files_AFTER_UPDATE`');
		this.addSql('drop trigger if exists `directories_AFTER_INSERT`');
		this.addSql('drop trigger if exists `directories_AFTER_UPDATE`');
		this.addSql('drop trigger if exists `directories_AFTER_DELETE`');
	}
}
