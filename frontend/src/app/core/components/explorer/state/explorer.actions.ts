export namespace ExplorerActions {
	export class Open {
		public static readonly type = '[Explorer] Open';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}

	export class DeleteDirectory {
		public static readonly type = '[Explorer] Delete Directory';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}

	export class DeleteFile {
		public static readonly type = '[Explorer] Delete File';

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

	export class Upload {
		public static readonly type = '[Explorer] Upload';

		public readonly file: File;

		constructor(file: File) {
			this.file = file;
		}
	}
}
