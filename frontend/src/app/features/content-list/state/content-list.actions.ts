import { ContentType } from 'src/app/features/content-list/components/pure-content-list/pure-content-list.component';

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

	export class FetchContent {
		public static readonly type = '[Content List] Fetch Content';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}

	export class AddDirectory {
		public static readonly type = '[Content List] Add Directory';

		public readonly directory: ContentType;

		constructor(directory: ContentType) {
			this.directory = directory;
		}
	}
}
