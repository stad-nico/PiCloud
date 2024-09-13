import { Crumb } from 'src/app/features/breadcrumbs/components/pure-breadcrumbs/pure-breadcrumbs.component';

export namespace BreadcrumbsActions {
	export class Add {
		public static readonly type = '[Breadcrumbs] Add';

		public readonly crumbs: Array<Crumb>;

		constructor(crumbs: Array<Crumb>) {
			this.crumbs = crumbs;
		}
	}

	export class Set {
		public static readonly type = '[Breadcrumbs] Set';

		public readonly crumbs: Array<Crumb>;

		constructor(crumbs: Array<Crumb>) {
			this.crumbs = crumbs;
		}
	}

	export class BuildCrumbs {
		public static readonly type = '[Breadcrumbs] Build Crumbs';

		public readonly id: string;

		constructor(id: string) {
			this.id = id;
		}
	}
}
