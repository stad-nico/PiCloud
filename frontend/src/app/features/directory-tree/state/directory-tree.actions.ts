import { DirectoryMetadataResponse } from 'generated';

export namespace DirectoryTreeActions {
	export class FetchInitialContent {
		public static readonly type = '[Directory Tree] Fetch Initial Content';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}

	export class FetchContent {
		public static readonly type = '[Directory Tree] Fetch Content';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}

	export class Open {
		public static readonly type = '[Directory Tree] Open';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}

	export class Unselect {
		public static readonly type = '[Directory Tree] Unselect';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}

	export class Select {
		public static readonly type = '[Directory Tree] Select';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}

	export class Expand {
		public static readonly type = '[Directory Tree] Expand';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}

	export class Collapse {
		public static readonly type = '[Directory Tree] Collapse';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}

	export class Remove {
		public static readonly type = '[Directory Tree] Remove';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}

	export class AddDirectory {
		public static readonly type = '[Directory Tree] Add Directory';

		public readonly directory: DirectoryMetadataResponse & { id: string };

		constructor(directory: DirectoryMetadataResponse & { id: string }) {
			this.directory = directory;
		}
	}
}
