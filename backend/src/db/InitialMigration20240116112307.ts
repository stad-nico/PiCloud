import { Migration } from '@mikro-orm/migrations';

const createDirectoriesTable = `
    CREATE TABLE \`directories\` (
	    \`uuid\` VARCHAR(255) NOT NULL DEFAULT uuid(),
	    \`name\` VARCHAR(255) NOT NULL,
	    \`parentId\` VARCHAR(255) NULL DEFAULT NULL,
    	\`isRecycled\` TINYINT(4) NULL DEFAULT "0",
	    \`created\` DATETIME NOT NULL DEFAULT current_timestamp(),
	    \`updated\` DATETIME NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	    PRIMARY KEY (\`uuid\`),
	    INDEX \`FK_b694a803692de09ba05a875fe29\` (\`parentId\`),
	    CONSTRAINT \`FK_b694a803692de09ba05a875fe29\` FOREIGN KEY (\`parentId\`) REFERENCES \`directories\` (\`uuid\`) ON UPDATE RESTRICT ON DELETE RESTRICT
    ) ENGINE=InnoDB;`;

const createFilesTable = `
    CREATE TABLE \`files\` (
	    \`uuid\` VARCHAR(255) NOT NULL DEFAULT uuid(),
	    \`name\` VARCHAR(255) NOT NULL,
	    \`parentId\` VARCHAR(255) NULL DEFAULT NULL,
	    \`mimeType\` VARCHAR(255) NOT NULL DEFAULT 'application/octet-stream',
	    \`size\` BIGINT NOT NULL DEFAULT '0',
	    \`isRecycled\` TINYINT NOT NULL DEFAULT '0',
	    \`created\` DATETIME NOT NULL DEFAULT current_timestamp(),
	    \`updated\` DATETIME NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	    PRIMARY KEY (\`uuid\`),
	    INDEX \`FK_ab1c78280af378a90675f0d2b29\` (\`parentId\`),
	    CONSTRAINT \`FK_ab1c78280af378a90675f0d2b29\` FOREIGN KEY (\`parentId\`) REFERENCES \`directories\` (\`uuid\`) ON UPDATE RESTRICT ON DELETE RESTRICT
    ) ENGINE=InnoDB;`;

const createTreeTable = `
    CREATE TABLE \`tree\` (
	    \`id\` INT NOT NULL AUTO_INCREMENT,
	    \`parent\` VARCHAR(255) NULL DEFAULT NULL,
	    \`child\` VARCHAR(255) NOT NULL,
	    \`depth\` INT NOT NULL DEFAULT '0',
	    PRIMARY KEY (\`id\`),
	    UNIQUE INDEX \`IDX_d2b461f93e3ec1f02135ae7ee8\` (\`child\`, \`parent\`)
    ) ENGINE=InnoDB;`;

const getUpmostDirnameFunc = `
	CREATE OR REPLACE FUNCTION \`GET_UPMOST_DIRNAME\`(\`path\` VARCHAR(255)) RETURNS varchar(255) DETERMINISTIC
	BEGIN
		IF path = "" THEN
			RETURN CAST(NULL AS VARCHAR(255));
		END IF;

		IF LOCATE("/", PATH) = 0 THEN
			RETURN path;
		END IF;

		RETURN SUBSTR(path, 1, LOCATE("/", path) - 1);
	END`;

const getPathAfterUpmostDirnameFunc = `
	CREATE OR REPLACE FUNCTION \`GET_PATH_AFTER_UPMOST_DIRNAME\`(\`path\` VARCHAR(255)) RETURNS varchar(255) DETERMINISTIC
	BEGIN
		RETURN INSERT(path, LOCATE(GET_UPMOST_DIRNAME(path), path), CHAR_LENGTH(GET_UPMOST_DIRNAME(PATH)) + 1, '');
	END`;

const getFileUuidFunc = `
	CREATE OR REPLACE FUNCTION \`GET_FILE_UUID\`(\`path\` VARCHAR(255)) RETURNS varchar(255) DETERMINISTIC
	BEGIN
		DECLARE nextPath VARCHAR(255) DEFAULT TRIM(LEADING "/" FROM path);
		DECLARE nextUuid VARCHAR(255) DEFAULT (SELECT uuid FROM directories WHERE directories.name = GET_UPMOST_DIRNAME(nextPath) AND directories.parentId IS NULL);

		SET nextPath = GET_PATH_AFTER_UPMOST_DIRNAME(nextPath);

		WHILE LOCATE("/", nextPath) != 0 DO
			SET nextUuid = (SELECT uuid FROM directories WHERE directories.parentId = nextUuid AND directories.name = GET_UPMOST_DIRNAME(nextPath));
			SET nextPath = GET_PATH_AFTER_UPMOST_DIRNAME(nextPath);
		END WHILE;

		RETURN (SELECT uuid FROM files WHERE files.name = nextPath AND files.parentId = nextUuid OR (nextUuid IS NULL AND files.parentId IS NULL));
	END`;

const getFilePathFunc = `
	CREATE OR REPLACE FUNCTION \`GET_FILE_PATH\`(\`uuid\` VARCHAR(255)) RETURNS varchar(255) DETERMINISTIC
	BEGIN
		DECLARE path VARCHAR(255) DEFAULT (SELECT name FROM files WHERE files.uuid = uuid);
		DECLARE nextUuid VARCHAR(255) DEFAULT (SELECT parentId FROM files WHERE files.uuid = uuid);

		WHILE nextUuid IS NOT NULL DO
			SET path = CONCAT((SELECT name FROM directories WHERE directories.uuid = nextUuid), "/", path);
			SET nextUuid = (SELECT parentId FROM directories WHERE directories.uuid = nextUuid);

		END WHILE;

		RETURN path;
	END`;

const getDirectoryUuidFunc = `
	CREATE OR REPLACE FUNCTION \`GET_DIRECTORY_UUID\`(\`path\` VARCHAR(255)) RETURNS varchar(255) DETERMINISTIC
	BEGIN
		DECLARE nextPath VARCHAR(255) DEFAULT TRIM(LEADING "/" FROM path);
		DECLARE nextUuid VARCHAR(255) DEFAULT (SELECT uuid FROM directories WHERE directories.name = GET_UPMOST_DIRNAME(nextPath) AND directories.parentId IS NULL);

		SET nextPath = GET_PATH_AFTER_UPMOST_DIRNAME(nextPath);

		WHILE nextPath != "" DO
			SET nextUuid = (SELECT uuid FROM directories WHERE directories.parentId = nextUuid AND directories.name = GET_UPMOST_DIRNAME(nextPath));
			SET nextPath = GET_PATH_AFTER_UPMOST_DIRNAME(nextPath);
		END WHILE;

		RETURN nextUuid;
	END`;

const getDirectoryPathFunc = `
	CREATE OR REPLACE FUNCTION \`GET_DIRECTORY_PATH\`(\`uuid\` VARCHAR(255)) RETURNS varchar(255) DETERMINISTIC
	BEGIN
		DECLARE path VARCHAR(255) DEFAULT (SELECT name FROM directories WHERE directories.uuid = uuid);
		DECLARE nextUuid VARCHAR(255) DEFAULT (SELECT parentId FROM directories WHERE directories.uuid = uuid);

		IF uuid IS NULL THEN
			RETURN "/";
		END IF;

		WHILE nextUuid IS NOT NULL DO
			SET path = CONCAT((SELECT name FROM directories WHERE directories.uuid = nextUuid), "/", path);
			SET nextUuid = (SELECT parentId FROM directories WHERE directories.uuid = nextUuid);

		END WHILE;

		RETURN path;
	END`;

const getDirectorySizeFunc = `
	CREATE OR REPLACE FUNCTION \`GET_DIRECTORY_SIZE\`(\`uuid\` VARCHAR(255)) RETURNS bigint(20) DETERMINISTIC
	BEGIN
		RETURN (
			SELECT COALESCE(SUM(size),0) AS size
			FROM tree
			INNER JOIN files ON tree.child = files.uuid
			WHERE tree.parent = uuid AND files.isRecycled = 0
		);
	END`;

const directoriesAfterInsertTrigger = `
	CREATE OR REPLACE TRIGGER \`directories_AFTER_INSERT\` AFTER INSERT ON \`directories\`
	FOR EACH ROW BEGIN
		# create first flat entry (self, self, 0)
		INSERT INTO tree (parent, child, depth)
		SELECT NEW.uuid, NEW.uuid, 0;

    	# create hierarchical entries
    	# depends on flat entries - must be a seperate insert
    	INSERT INTO tree (parent, child, depth)
    	SELECT p.parent, c.child, p.depth + c.depth + 1
    	FROM tree p JOIN tree c
    	WHERE p.child = NEW.parentId AND c.parent = NEW.uuid;
	END`;

const directoriesAfterUpdateTrigger = `
	CREATE OR REPLACE TRIGGER \`directories_AFTER_UPDATE\` AFTER UPDATE ON \`directories\` FOR EACH ROW BEGIN
		IF OLD.uuid != NEW.uuid THEN
			UPDATE tree
			SET parentId = NEW.uuid
			WHERE parentId = OLD.uuid;

        	UPDATE tree
			SET child = NEW.uuid
				WHERE child = OLD.uuid;
    	END IF;

    	IF OLD.parentId != NEW.parentId THEN
			# remove all paths to subtree but not paths inside the subtree
			DELETE FROM tree
			WHERE tree.child IN
				(SELECT child FROM (SELECT * FROM tree) AS a WHERE a.parentId = NEW.uuid)
            AND tree.parent NOT IN
				(SELECT child FROM (SELECT * FROM tree) AS b WHERE b.parentId = NEW.uuid);

			INSERT INTO tree (parent, child, depth)
				SELECT supertree.parent, subtree.child, supertree.depth + subtree.depth + 1
				FROM tree AS supertree JOIN tree AS subtree
				WHERE subtree.parent = NEW.uuid AND supertree.child = NEW.parentId;
    	END IF;
	END`;

const directoriesAfterDeleteTrigger = `
	CREATE OR REPLACE TRIGGER \`directories_AFTER_DELETE\` AFTER DELETE ON \`directories\` FOR EACH ROW BEGIN
		DELETE FROM tree
    	WHERE tree.child IN
			(SELECT child FROM (SELECT * FROM tree) AS a WHERE a.parentId = OLD.uuid);
	END`;

const filesAfterInsertTrigger = `
	CREATE OR REPLACE TRIGGER \`files_AFTER_INSERT\` AFTER INSERT ON \`files\` FOR EACH ROW BEGIN
		INSERT INTO tree (parent, child, depth)
    	SELECT parent, NEW.uuid, depth + 1
      	FROM tree
      	WHERE child = NEW.parentId;
	END`;

const filesAfterUpdateTrigger = `
	CREATE OR REPLACE TRIGGER \`files_AFTER_UPDATE\` AFTER UPDATE ON \`files\` FOR EACH ROW BEGIN
		IF OLD.uuid != NEW.uuid THEN
			UPDATE tree SET child = NEW.uuid WHERE child = OLD.uuid;
    	END IF;

    	IF OLD.parentId != NEW.parentId THEN
			UPDATE tree SET parentId = NEW.parentId WHERE child = OLD.uuid AND parentId = OLD.parentId;
    	END IF;
	END`;

const filesAfterDeleteTrigger = `
	CREATE OR REPLACE TRIGGER \`files_AFTER_DELETE\` AFTER DELETE ON \`files\` FOR EACH ROW BEGIN
		DELETE FROM tree
    	WHERE child = OLD.uuid;
	END`;

export class InitialMigration20240116112307 extends Migration {
	public async up(): Promise<void> {
		this.addSql(createDirectoriesTable);
		this.addSql(createFilesTable);
		this.addSql(createTreeTable);

		this.addSql(filesAfterInsertTrigger);
		this.addSql(filesAfterUpdateTrigger);
		this.addSql(filesAfterDeleteTrigger);
		this.addSql(directoriesAfterInsertTrigger);
		this.addSql(directoriesAfterUpdateTrigger);
		this.addSql(directoriesAfterDeleteTrigger);

		this.addSql(getUpmostDirnameFunc);
		this.addSql(getPathAfterUpmostDirnameFunc);
		this.addSql(getDirectoryPathFunc);
		this.addSql(getDirectoryUuidFunc);
		this.addSql(getFilePathFunc);
		this.addSql(getFileUuidFunc);
		this.addSql(getDirectorySizeFunc);
	}

	public async down(): Promise<void> {
		this.addSql(`DROP TRIGGER IF EXISTS \`files_AFTER_INSERT\``);
		this.addSql(`DROP TRIGGER IF EXISTS \`files_AFTER_DELETE\``);
		this.addSql(`DROP TRIGGER IF EXISTS \`files_AFTER_UPDATE\``);
		this.addSql(`DROP TRIGGER IF EXISTS \`directories_AFTER_INSERT\``);
		this.addSql(`DROP TRIGGER IF EXISTS \`directories_AFTER_UPDATE\``);
		this.addSql(`DROP TRIGGER IF EXISTS \`directories_AFTER_DELETE\``);

		this.addSql(`DROP FUNCTION IF EXISTS \`GET_UPMOST_DIRNAME\``);
		this.addSql(`DROP FUNCTION IF EXISTS \`GET_PATH_AFTER_UPMOST_DIRNAME\``);
		this.addSql(`DROP FUNCTION IF EXISTS \`GET_DIRECTORY_PATH\``);
		this.addSql(`DROP FUNCTION IF EXISTS \`GET_DIRECTORY_UUID\``);
		this.addSql(`DROP FUNCTION IF EXISTS \`GET_FILE_PATH\``);
		this.addSql(`DROP FUNCTION IF EXISTS \`GET_FILE_UUID\``);
		this.addSql(`DROP FUNCTION IF EXISTS \`GET_DIRECTORY_SIZE\``);

		this.addSql(`DROP TABLE \`files\``);
		this.addSql(`DROP TABLE \`directories\``);
		this.addSql(`DROP TABLE \`tree\``);
	}
}
