export namespace DirectoryTreeActions {
	export class Select {
		public static readonly type = '[Directory Tree] Select';

		public readonly id: number;

		constructor(id: number) {
			this.id = id;
		}
	}

	export class Expand {
		public static readonly type = '[Directory Tree] Expand';

		public readonly id: number;

		constructor(id: number) {
			this.id = id;
		}
	}

	export class Collapse {
		public static readonly type = '[Directory Tree] Collapse';

		public readonly id: number;

		constructor(id: number) {
			this.id = id;
		}
	}
}
