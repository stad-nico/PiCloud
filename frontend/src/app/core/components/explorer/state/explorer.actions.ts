import { Type } from 'src/app/core/components/explorer/state/explorer.state';

export namespace ExplorerActions {
	export class Open {
		public static readonly type = '[Explorer] Open';

		public readonly id: string;

		public readonly type: Type;

		public readonly name?: string;

		constructor(id: string, type: Type, name?: string) {
			this.id = id;
			this.type = type;
			this.name = name;
		}
	}

	export class SetDirectory {
		public static readonly type = '[Explorer] Set Directory';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}

	export class LoadInitialContent {
		public static readonly type = '[Explorer] Load Initial Content';
	}

	export class LoadContent {
		public static readonly type = '[Explorer] Load Content';

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

	export class DeleteDirectory {
		public static readonly type = '[Explorer] Delete Directory';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}

	export class UploadFile {
		public static readonly type = '[Explorer] Upload File';

		public readonly file: File;

		constructor(file: File) {
			this.file = file;
		}
	}

	export class DeleteFile {
		public static readonly type = '[Explorer] Delete File';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}

	export class ShowCreateDirectoryComponent {
		public static readonly type = '[Explorer] Show Create Directory Component';
	}

	export class HideCreateDirectoryComponent {
		public static readonly type = '[Explorer] Hide Create Directory Component';
	}
}
