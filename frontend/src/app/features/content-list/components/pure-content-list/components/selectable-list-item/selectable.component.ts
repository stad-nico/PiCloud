import { forwardRef, Injectable } from '@angular/core';
import { ISelectable } from 'src/app/shared/models/ISelectable';

@Injectable()
export class SelectableComponent {}

export const SelectableProvider = <T extends ISelectable>(component: new () => T) => {
	return {
		provide: SelectableComponent,
		useExisting: forwardRef(() => component),
	};
};
