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
		params: {
			parent: parent,
			name: name,
		},
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
		params: {
			parent: parent,
			name: name,
		},
	};
}

const insertQuery = `
	INSERT INTO directories (name, parent) 
	VALUES (:name, :parent)
`;
