// import { QueryOperation } from 'src/db/Connection';
// import {
// 	Directory,
// 	InsertPartial,
// 	SelectKeys,
// 	SelectOptions,
// 	SoftDeleteWhereOptions,
// 	UpdatePartial,
// 	WhereKeys,
// 	WhereOptions,
// } from 'src/db/entities/Directory';
// import { QueryBundle } from 'src/db/queries/File';

// export type Query = {
// 	query: string;
// 	params: unknown;
// 	operation: QueryOperation;
// };

// export type SelectQuery<T extends SelectKeys> = Query & {
// 	operation: QueryOperation.Select;
// 	columns: Array<T>;
// };

// export type UpdateQuery = Query & {
// 	operation: QueryOperation.Update;
// };

// export type InsertQuery = Query & {
// 	operation: QueryOperation.Insert;
// };

// export type DeleteQuery = Query & {
// 	operation: QueryOperation.Delete;
// };

// function buildSoftDeleteWhereClause<T extends WhereKeys>(whereOptions: SoftDeleteWhereOptions<T>): string {
// 	return Object.entries(whereOptions)
// 		.map(([column, value]) => {
// 			if (column === 'root') {
// 				return 'tree.parent = :root';
// 			}

// 			if (column === 'path') {
// 				return `uuid = GET_DIRECTORY_UUID(:path)`;
// 			}

// 			if (value === null) {
// 				return `${column} IS NULL`;
// 			}

// 			return `directories.${column} = :${column}`;
// 		})
// 		.join(' AND ');
// }

// function buildWhereClause<T extends WhereKeys>(whereOptions: WhereOptions<T>): string {
// 	return Object.entries(whereOptions)
// 		.map(([row, value]) => {
// 			if (row === 'path') {
// 				return `uuid = GET_DIRECTORY_UUID(:path)`;
// 			}

// 			if (value === null) {
// 				return `${row} IS NULL`;
// 			}

// 			return `directories.${row} = :${row}`;
// 		})
// 		.join(' AND ');
// }

// function buildSelectClause<T extends SelectKeys>(select: SelectOptions<T>): string {
// 	return select
// 		.map((columnName) => {
// 			if (columnName === 'path') {
// 				return 'GET_DIRECTORY_PATH(uuid) AS path';
// 			} else if (columnName === 'size') {
// 				return 'GET_DIRECTORY_SIZE(uuid) AS size';
// 			} else if (columnName === 'filesAmt') {
// 				return 'GET_DIRECTORY_FILES_AMT(uuid) AS filesAmt';
// 			} else if (columnName === 'directoriesAmt') {
// 				return 'GET_DIRECTORY_SUBDIR_AMT(uuid) AS directoriesAmt';
// 			}

// 			return columnName;
// 		})
// 		.join(', ');
// }

// export function selectAll<T extends WhereKeys, K extends SelectKeys>(where: WhereOptions<T>, select: SelectOptions<K>): SelectQuery<K> {
// 	const selectClause = buildSelectClause(select);
// 	const whereClause = buildWhereClause(where);

// 	return {
// 		query: `SELECT ${selectClause} FROM directories WHERE ${whereClause}`,
// 		params: where,
// 		operation: QueryOperation.Select,
// 		columns: select,
// 	};
// }

// export function selectOne<T extends WhereKeys, K extends SelectKeys>(where: WhereOptions<T>, select: SelectOptions<K>): SelectQuery<K> {
// 	const whereClause = buildWhereClause(where);
// 	const selectClause = buildSelectClause(select);

// 	return {
// 		query: `SELECT ${selectClause} FROM directories WHERE ${whereClause} LIMIT 1`,
// 		params: where,
// 		operation: QueryOperation.Select,
// 		columns: select,
// 	};
// }

// export function update<T extends WhereKeys, K extends keyof Directory>(where: WhereOptions<T>, partial: UpdatePartial<K>): UpdateQuery {
// 	const setClause = Object.entries(partial)
// 		.map(([row, value]) => `${row} = "${value}"`)
// 		.join(' AND ');

// 	const whereClause = buildWhereClause(where);

// 	return {
// 		query: `UPDATE directories SET ${setClause} WHERE ${whereClause}`,
// 		params: where,
// 		operation: QueryOperation.Update,
// 	};
// }

// export function insert<T extends keyof Directory>(values: InsertPartial<T>): InsertQuery {
// 	const columns = Object.keys(values).join(', ');
// 	const valuePlaceholders = Object.keys(values)
// 		.map((column) => `:${column}`)
// 		.join(', ');

// 	return {
// 		query: `INSERT INTO directories (${columns}) VALUES (${valuePlaceholders})`,
// 		params: values,
// 		operation: QueryOperation.Insert,
// 	};
// }

// export function hardDelete<W extends WhereKeys>(where: WhereOptions<W>): DeleteQuery {
// 	const whereClause = buildWhereClause(where);

// 	return {
// 		query: `DELETE FROM directories WHERE ${whereClause}`,
// 		params: where,
// 		operation: QueryOperation.Delete,
// 	};
// }

// export function softDelete<W extends WhereKeys>(where: SoftDeleteWhereOptions<W>): UpdateQuery {
// 	const query = `UPDATE directories SET isRecycled = 1 WHERE uuid IN (
// 		SELECT child
// 		FROM tree
// 		INNER JOIN directories ON directories.uuid = tree.child
// 		WHERE ${buildSoftDeleteWhereClause(where)}
// 	);`;

// 	return {
// 		query: query,
// 		params: where,
// 		operation: QueryOperation.Update,
// 	};
// }

// /**
//  *
//  * @param path - the path with a trailing slash and no leading slash (e.g. `A/B/C/`)
//  * @returns
//  */
// export function getUuidByPathAndNotRecycled(path: string): QueryBundle {
// 	return {
// 		query: getUuidByPathAndNotRecycledQuery,
// 		params: { path: path },
// 	};
// }

// const getUuidByPathAndNotRecycledQuery = `
//     WITH RECURSIVE prev (nextPath, uuid, iteration) AS (
// 		SELECT :path, CAST(NULL AS VARCHAR(255)), 0

// 		UNION ALL

// 		SELECT GET_PATH_AFTER_UPMOST_DIRNAME(prev.nextPath), next.uuid, prev.iteration + 1
// 		FROM directories AS next
// 		INNER JOIN prev WHERE
// 			(next.parent IS NULL AND prev.uuid IS NULL AND next.name = GET_UPMOST_DIRNAME(prev.nextPath)) OR
// 			(next.parent = prev.uuid AND next.name = GET_UPMOST_DIRNAME(prev.nextPath)) OR
// 			(GET_UPMOST_DIRNAME(prev.nextPath) = "" AND next.name = prev.nextPath AND next.parent = prev.uuid)
// 	),
// 	result AS (
// 		SELECT uuid FROM prev WHERE iteration = (
// 			SELECT MAX(iteration) FROM prev
// 		)
// 	)

// 	SELECT directories.uuid
// 	FROM directories
// 	RIGHT JOIN result ON directories.uuid = result.uuid
// 	WHERE directories.isRecycled = 0 OR (directories.uuid IS NULL AND directories.isRecycled IS NULL AND result.uuid IS NULL);
// `;

// export function doesNotRecycledDirectoryWithParentAndNameAlreadyExist(parent: string, name: string): QueryBundle {
// 	return {
// 		query: doesNotRecycledDirectoryWithParentAndNameAlreadyExistQuery,
// 		params: { parent: parent, name: name },
// 	};
// }

// const doesNotRecycledDirectoryWithParentAndNameAlreadyExistQuery = `
// 	SELECT COUNT(1)
// 	FROM directories
// 	WHERE (parent = :parent OR (:parent IS NULL AND parent IS NULL)) AND name = :name;
// `;

// // export function insert(parent: string, name: string): QueryBundle {
// // 	return {
// // 		query: insertQuery,
// // 		params: { parent: parent, name: name },
// // 	};
// // }

// const insertQuery = `
// 	INSERT INTO directories (name, parent)
// 	VALUES (:name, :parent)
// `;

// export function softDeleteSubtreeByRootUuid(uuid: string): QueryBundle {
// 	return {
// 		query: softDeleteSubtreeByRootUuidQuery,
// 		params: { uuid: uuid },
// 	};
// }

// const softDeleteSubtreeByRootUuidQuery = `
// 	UPDATE directories SET isRecycled = 1 WHERE uuid IN (
// 		SELECT child
// 		FROM tree
// 		WHERE parent = "2"
// 	);
// `;

// export function renameByUuid(uuid: string, name: string): QueryBundle {
// 	return {
// 		query: renameByPathQuery,
// 		params: { uuid: uuid, name: name },
// 	};
// }

// const renameByPathQuery = `
// 	UPDATE directories SET name = :name WHERE uuid = :uuid;
// `;

// export function getUuidByParentAndNameAndNotRecycled(parent: string, name: string): QueryBundle {
// 	return {
// 		query: getUuidByParentAndNameAndNotRecycledQuery,
// 		params: { parent: parent, name: name },
// 	};
// }

// const getUuidByParentAndNameAndNotRecycledQuery = `
// 	SELECT uuid FROM directories WHERE parent = :parent AND name = :name AND isRecycled = 0
// `;

// export function hardDeleteByUuid(uuid: string): QueryBundle {
// 	return {
// 		query: hardDeleteByUuidQuery,
// 		params: { uuid: uuid },
// 	};
// }

// const hardDeleteByUuidQuery = `
// 	DELETE FROM directories WHERE uuid = :uuid;
// `;

// export function updateParentByUuid(uuid: string, parent: string): QueryBundle {
// 	return {
// 		query: updateParentByUuidQuery,
// 		params: { uuid: uuid, parent: parent },
// 	};
// }

// const updateParentByUuidQuery = `
// 	UPDATE directories SET parent = :parent WHERE uuid = :uuid;
// `;

// export function getMetadataByUuid(uuid: string): QueryBundle {
// 	return {
// 		query: getMetadataByUuidQuery,
// 		params: { uuid: uuid },
// 	};
// }

// const getMetadataByUuidQuery = `

// 	WITH filesAmt AS (
// 		SELECT COUNT(*) AS filesAmt
// 		FROM tree
// 		INNER JOIN files ON tree.parent = files.uuid
// 		WHERE tree.parent = :uuid AND files.isRecycled = 0
// 	),
// 	directoriesAmt AS (
// 		SELECT COUNT(*) - 1 AS directoriesAmt
// 		FROM tree
// 		INNER JOIN directories ON tree.parent = directories.uuid
// 		WHERE tree.parent = :uuid AND directories.isRecycled = 0
// 	),
// 	size AS (
// 		SELECT COUNT(size) AS size
// 		FROM tree
// 		INNER JOIN files ON tree.child = files.uuid
// 		WHERE tree.parent = :uuid AND files.isRecycled = 0
// 	)

// 	SELECT uuid, name, GET_DIRECTORY_PATH(uuid) as path, size, filesAmt AS \`files\`, directoriesAmt AS \`directories\`, createdAt AS created, updatedAt as updated
// 	FROM filesAmt
// 	CROSS JOIN directoriesAmt
// 	CROSS JOIN size
// 	CROSS JOIN directories ON directories.uuid = :uuid
// `;

// export function getFilesContentByUuid(uuid: string): QueryBundle {
// 	return {
// 		query: getFilesContentByUuidQuery,
// 		params: { uuid: uuid },
// 	};
// }

// const getFilesContentByUuidQuery = `
// 	SELECT name, mimeType, size, createdAt AS created, updatedAt AS updated
// 	FROM files
// 	WHERE parent = :uuid AND files.isRecycled = 0
// `;

// export function getDirectoriesContentByUuid(uuid: string): QueryBundle {
// 	return {
// 		query: getDirectoriesContentByUuidQuery,
// 		params: { uuid: uuid },
// 	};
// }

// const getDirectoriesContentByUuidQuery = `
// 	WITH size AS (
// 		SELECT COUNT(size) AS size
// 		FROM tree
// 		INNER JOIN files ON tree.child = files.uuid
// 		WHERE tree.parent = "3"
// 	)
// 	SELECT name, size, createdAt AS created, updatedAt AS updated
// 	FROM size
// 	CROSS JOIN directories
// 	WHERE parent = "1" AND directories.isRecycled = 0
// `;

// export function getFilesUuidAndPathByRootUuid(uuid: string): QueryBundle {
// 	return {
// 		query: getFilesUuidAndPathByRootUuidQuery,
// 		params: { uuid: uuid },
// 	};
// }

// const getFilesUuidAndPathByRootUuidQuery = `
// 	SELECT uuid, GET_FILE_PATH(uuid) AS path
// 	FROM tree
// 	INNER JOIN files ON tree.child = files.uuid
// 	WHERE tree.parent = :uuid AND files.isRecycled = 0
// `;

// const r = `
// 	SELECT ... FROM
// 	tree
// 	INNER JOIN files ON tree.child = files.uuid
// 	WHERE

// `;
