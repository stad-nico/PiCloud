export namespace ContentListActions {
	export class SelectSingle {
		public static readonly type = '[Content List] Select Single';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}

	export class UnselectSingle {
		public static readonly type = '[Content List] Unselect Single';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}

	export class SelectAll {
		public static readonly type = '[Content List] Select All';
	}

	export class UnselectAll {
		public static readonly type = '[Content List] Unselect All';
	}

	export class ShiftSelect {
		public static readonly type = '[Content List] Shift Select';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}

	export class ShiftUnselect {
		public static readonly type = '[Content List] Shift Unselect';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}

	export class CtrlSelect {
		public static readonly type = '[Content List] Ctrl Select';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}

	export class CtrlUnselect {
		public static readonly type = '[Content List] Ctrl Unselect';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}

	export class DeleteSelected {
		public static readonly type = '[Content List] Delete Selected';
	}

	export class DownloadFile {
		public static readonly type = '[Content List] Download File';

		public readonly id: string;

		public readonly name: string;

		constructor(id: string, name: string) {
			this.id = id;
			this.name = name;
		}
	}

	export class DownloadDirectory {
		public static readonly type = '[Content List] Download Directory';

		public readonly id: string;

		public readonly name: string;

		constructor(id: string, name: string) {
			this.id = id;
			this.name = name;
		}
	}
}
