import { QueryBundle } from 'src/db/queries/File';

/**
 *
 * @param path - the path with a trailing slash and no leading slash (e.g. `A/B/C/`)
 * @returns
 */
export function getUuidByPathAndNotRecycled(path: string): QueryBundle {
	return {
		query: getUuidByPathAndNotRecycledQuery,
		params: { path: path },
	};
}

const getUuidByPathAndNotRecycledQuery = `
    WITH RECURSIVE prev (nextPath, uuid, iteration) AS (
		SELECT :path, CAST(NULL AS VARCHAR(255)), 0
	
		UNION ALL
	
		SELECT GET_PATH_AFTER_UPMOST_DIRNAME(prev.nextPath), next.uuid, prev.iteration + 1
		FROM directories AS next
		INNER JOIN prev WHERE 
			(next.parent IS NULL AND prev.uuid IS NULL AND next.name = GET_UPMOST_DIRNAME(prev.nextPath)) OR
			(next.parent = prev.uuid AND next.name = GET_UPMOST_DIRNAME(prev.nextPath)) OR 
			(GET_UPMOST_DIRNAME(prev.nextPath) = "" AND next.name = prev.nextPath AND next.parent = prev.uuid)
	),
	result AS (
		SELECT uuid FROM prev WHERE iteration = (
			SELECT MAX(iteration) FROM prev 
		)
	)

	SELECT directories.uuid
	FROM directories
	RIGHT JOIN result ON directories.uuid = result.uuid
	WHERE directories.isRecycled = 0 OR (directories.uuid IS NULL AND directories.isRecycled IS NULL AND result.uuid IS NULL);
`;

export function doesNotRecycledDirectoryWithParentAndNameAlreadyExist(parent: string, name: string): QueryBundle {
	return {
		query: doesNotRecycledDirectoryWithParentAndNameAlreadyExistQuery,
		params: { parent: parent, name: name },
	};
}

const doesNotRecycledDirectoryWithParentAndNameAlreadyExistQuery = `
	SELECT COUNT(1)
	FROM directories
	WHERE (parent = :parent OR (:parent IS NULL AND parent IS NULL)) AND name = :name;
`;

export function insert(parent: string, name: string): QueryBundle {
	return {
		query: insertQuery,
		params: { parent: parent, name: name },
	};
}

const insertQuery = `
	INSERT INTO directories (name, parent) 
	VALUES (:name, :parent)
`;

export function softDeleteSubtreeByRootUuid(uuid: string): QueryBundle {
	return {
		query: softDeleteSubtreeByRootUuidQuery,
		params: { uuid: uuid },
	};
}

const softDeleteSubtreeByRootUuidQuery = `
	UPDATE directories SET isRecycled = 1 WHERE uuid IN (
		SELECT child
		FROM tree
		WHERE parent = "2"
	);
`;

export function renameByUuid(uuid: string, name: string): QueryBundle {
	return {
		query: renameByPathQuery,
		params: { uuid: uuid, name: name },
	};
}

const renameByPathQuery = `
	UPDATE directories SET name = :name WHERE uuid = :uuid;
`;

export function getUuidByParentAndNameAndNotRecycled(parent: string, name: string): QueryBundle {
	return {
		query: getUuidByParentAndNameAndNotRecycledQuery,
		params: { parent: parent, name: name },
	};
}

const getUuidByParentAndNameAndNotRecycledQuery = `
	SELECT uuid FROM directories WHERE parent = :parent AND name = :name AND isRecycled = 0
`;

export function hardDeleteByUuid(uuid: string): QueryBundle {
	return {
		query: hardDeleteByUuidQuery,
		params: { uuid: uuid },
	};
}

const hardDeleteByUuidQuery = `
	DELETE FROM directories WHERE uuid = :uuid;
`;

export function updateParentByUuid(uuid: string, parent: string): QueryBundle {
	return {
		query: updateParentByUuidQuery,
		params: { uuid: uuid, parent: parent },
	};
}

const updateParentByUuidQuery = `
	UPDATE directories SET parent = :parent WHERE uuid = :uuid;
`;

export function getMetadataByUuid(uuid: string): QueryBundle {
	return {
		query: getMetadataByUuidQuery,
		params: { uuid: uuid },
	};
}

const getMetadataByUuidQuery = `
	WITH RECURSIVE pathSelect (iteration, uuid, name, parent) as (
		SELECT 0, uuid, name, parent
    	FROM directories
    	WHERE uuid = :uuid
		UNION ALL
    	SELECT pathSelect.iteration + 1, next_.uuid, next_.name, next_.parent
    	FROM directories AS next_
    	INNER JOIN pathSelect
    	ON next_.uuid = pathSelect.parent
	),
	path AS (
		SELECT GROUP_CONCAT(name ORDER BY iteration DESC SEPARATOR "/") AS path FROM pathSelect
	),
	filesAmt AS (
		SELECT COUNT(*) AS filesAmt
		FROM tree
		INNER JOIN files ON tree.parent = files.uuid
		WHERE tree.parent = :uuid
	),
	directoriesAmt AS (
		SELECT COUNT(*) - 1 AS directoriesAmt
		FROM tree
		INNER JOIN directories ON tree.parent = directories.uuid
		WHERE tree.parent = :uuid
	),
	size AS (
		SELECT COUNT(size) AS size
		FROM tree
		INNER JOIN files ON tree.child = files.uuid
		WHERE tree.parent = :uuid
	)
	
	SELECT uuid, name, path, size, filesAmt AS \`files\`, directoriesAmt AS \`directories\`, createdAt AS created, updatedAt as updated
	FROM PATH 
	CROSS JOIN filesAmt
	CROSS JOIN directoriesAmt
	CROSS JOIN size
	CROSS JOIN directories ON directories.uuid = :uuid
`;

export function getFilesContentByUuid(uuid: string): QueryBundle {
	return {
		query: getFilesContentByUuidQuery,
		params: { uuid: uuid },
	};
}

const getFilesContentByUuidQuery = `
	SELECT name, mimeType, size, createdAt AS created, updatedAt AS updated
	FROM tree
	INNER JOIN files ON tree.child = files.uuid AND tree.depth = 1
	WHERE tree.parent = :uuid
`;

export function getDirectoriesContentByUuid(uuid: string): QueryBundle {
	return {
		query: getDirectoriesContentByUuidQuery,
		params: { uuid: uuid },
	};
}

const getDirectoriesContentByUuidQuery = `
	WITH size AS (
		SELECT COUNT(size) AS size
		FROM tree
		INNER JOIN files ON tree.child = files.uuid
		WHERE tree.parent = "3"
	)
	SELECT name, size, createdAt AS created, updatedAt AS updated
	FROM tree
	CROSS JOIN size
	INNER JOIN directories ON tree.child = directories.uuid AND tree.depth = 1
	WHERE tree.parent = :uuid
`;
