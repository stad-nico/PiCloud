import { ISelectable } from 'src/app/shared/models/ISelectable';

export type SelectEvent = {
	component?: ISelectable | null;
	selected: boolean;
	shift: boolean;
	ctrl: boolean;
};
