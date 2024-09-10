export namespace ExplorerActions {
	export class Open {
		public static readonly type = '[Explorer] Open';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}

	export class CreateDirectory {
		public static readonly type = '[Explorer] Create Directory';

		public readonly name: string;

		constructor(name: string) {
			this.name = name;
		}
	}

	export class ShowCreateDirectoryComponent {
		public static readonly type = '[Explorer] Show Create Directory Component';
	}

	export class HideCreateDirectoryComponent {
		public static readonly type = '[Explorer] Hide Create Directory Component';
	}
}
