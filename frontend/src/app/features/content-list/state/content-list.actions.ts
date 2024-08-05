import { ActivatedRoute } from '@angular/router';

export namespace ContentListActions {
	export class SelectSingle {
		public static readonly type = '[Content List] Select Single';

		public readonly id: number;

		constructor(id: number) {
			this.id = id;
		}
	}

	export class UnselectSingle {
		public static readonly type = '[Content List] Unselect Single';

		public readonly id: number;

		constructor(id: number) {
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

		public readonly id: number;

		constructor(id: number) {
			this.id = id;
		}
	}

	export class ShiftUnselect {
		public static readonly type = '[Content List] Shift Unselect';

		public readonly id: number;

		constructor(id: number) {
			this.id = id;
		}
	}

	export class CtrlSelect {
		public static readonly type = '[Content List] Ctrl Select';

		public readonly id: number;

		constructor(id: number) {
			this.id = id;
		}
	}

	export class CtrlUnselect {
		public static readonly type = '[Content List] Ctrl Unselect';

		public readonly id: number;

		constructor(id: number) {
			this.id = id;
		}
	}

	export class Open {
		public static readonly type = '[Content List] Open';

		public readonly id: number;

		public readonly route: ActivatedRoute;

		constructor(id: number, route: ActivatedRoute) {
			this.id = id;
			this.route = route;
		}
	}

	export class FetchContent {
		public static readonly type = '[Content List] Fetch Content';

		public readonly path: string;

		constructor(path: string) {
			this.path = path;
		}
	}
}
