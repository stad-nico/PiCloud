/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Migration } from '@mikro-orm/migrations';

export class Migration20250130173935 extends Migration {
	override async up(): Promise<void> {
		this.addSql(`CREATE TRIGGER \`directories_AFTER_INSERT\` AFTER INSERT ON \`directories\`
			FOR EACH ROW BEGIN

				# create first flat entry (self, self, 0)

				INSERT INTO tree (parentId, childId, depth)
					SELECT NEW.id, NEW.id, 0;

				# create hierarchical entries
				# depends on flat entries - must be a separate insert

				INSERT INTO tree (parentId, childId, depth)
					SELECT p.parentId, c.childId, p.depth + c.depth + 1 FROM tree p
					JOIN tree c
					WHERE p.childId = NEW.parentId AND c.parentId = NEW.id;
			END`);

		this.addSql(`CREATE TRIGGER \`directories_AFTER_UPDATE\` AFTER UPDATE ON \`directories\`
			FOR EACH ROW BEGIN

				IF OLD.parentId != NEW.parentId THEN

					# remove all paths to subtree but not paths inside the subtree

					DELETE FROM tree WHERE tree.childId IN (
						SELECT childId FROM (
							SELECT * FROM tree
						) AS a WHERE a.parentId = NEW.id)
					AND tree.parentId NOT IN (
						SELECT childId FROM (
							SELECT * FROM tree
						) AS b WHERE b.parentId = NEW.id
					);

					INSERT INTO tree (parentId, childId, depth)
						SELECT supertree.parentId, subtree.childId, supertree.depth + subtree.depth + 1
							FROM tree AS supertree
						JOIN tree AS subtree
							WHERE subtree.parentId = NEW.id AND supertree.childId = NEW.parentId
					ON DUPLICATE KEY UPDATE parentId = supertree.parentId, childId = subtree.childId, depth = supertree.depth + subtree.depth + 1;
				END IF;
			END`);
	}

	override async down(): Promise<void> {
		this.addSql('DROP TRIGGER `directories_AFTER_INSERT`');
		this.addSql('DROP TRIGGER `directories_AFTER_UPDATE`');
	}
}
