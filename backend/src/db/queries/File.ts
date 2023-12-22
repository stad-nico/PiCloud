import { File } from 'src/db/entities/File';

type QueryBundle = { query: string; params: Record<string, string | number | boolean> };

export function hardDeleteByUuid(uuid: string): QueryBundle {
	return {
		query: hardDeleteByUuidQuery,
		params: { uuid: uuid },
	};
}

const hardDeleteByUuidQuery = `DELETE FROM files WHERE uuid = :uuid`;

export function selectByPathAndNotRecycled<T extends keyof File>(path: string, columnsToSelect: T[]): QueryBundle {
	return {
		query: selectByPathAndNotRecycledQuery(columnsToSelect),
		params: {
			path: path,
		},
	};
}

const selectByPathAndNotRecycledQuery = <T extends keyof File>(columnsToSelect: T[]) => {
	return `
    WITH uuids AS (
	    WITH RECURSIVE prev_ (nextPath, uuid) AS (
		    SELECT GET_PATH_AFTER_UPMOST_DIRNAME(:path), 
                   uuid
		    FROM directories
		    WHERE name = GET_UPMOST_DIRNAME(:path)
              AND parent IS NULL
		    UNION ALL
		    SELECT GET_PATH_AFTER_UPMOST_DIRNAME(prev_.nextPath),
                   next_.uuid
		    FROM directories AS next_ 
		    INNER JOIN prev_ ON next_.name = GET_UPMOST_DIRNAME(prev_.nextPath)
              AND next_.parent = prev_.uuid
	    )
	    SELECT files.uuid 
	    FROM files 
	    INNER JOIN prev_ ON parent = prev_.uuid 
	      AND name = prev_.nextPath
    )
    SELECT ${columnsToSelect.join(', ')}
    FROM files 
    INNER JOIN uuids USING(uuid)
    WHERE isRecycled = 0`;
};
