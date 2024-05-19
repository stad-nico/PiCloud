export class GetTreeSubDirectories {
	static readonly type = '[Tree] Get subdirectories';

	constructor(public path: string) {}
}

export class GetTreeSubDirectoriesRecursive {
	static readonly type = '[Tree] Get subdirectories recursive';

	constructor(public path: string) {}
}
