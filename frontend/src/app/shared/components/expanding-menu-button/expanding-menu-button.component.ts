import { Component, HostBinding, Input } from '@angular/core';

export enum Direction {
	Up = 'up',
	Down = 'down',
	Left = 'left',
	Right = 'right',
}

@Component({
	selector: 'expanding-menu-button',
	standalone: true,
	templateUrl: './expanding-menu-button.component.html',
	styleUrl: './expanding-menu-button.component.css',
})
export class ExpandingMenuButtonComponent {
	/**
	 * The direction to which the menu will expand.
	 * @type {Direction}
	 */
	@Input()
	public direction!: Direction;

	@HostBinding('class')
	get classList(): string {
		return this.direction.toString();
	}
}
