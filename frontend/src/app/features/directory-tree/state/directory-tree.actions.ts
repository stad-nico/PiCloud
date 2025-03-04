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
}
