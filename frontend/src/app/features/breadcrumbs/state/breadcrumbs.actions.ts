export namespace BreadcrumbsActions {
	export class Add {
		public static readonly type = '[Breadcrumbs] Add';

		public readonly name: string;

		public readonly id: string;

		constructor(name: string, id: string) {
			this.name = name;
			this.id = id;
		}
	}
}
