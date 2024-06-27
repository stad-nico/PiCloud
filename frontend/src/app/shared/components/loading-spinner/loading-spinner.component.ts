import { Component, ElementRef, HostBinding, HostListener, Input } from '@angular/core';

export enum Type {
	Minimalistic = 'minimalistic',
	Rounded = 'rounded',
}

export enum Thickness {
	Thick = 'thick',
	Regular = 'regular',
	Thin = 'thin',
}

const ThicknessMap: Record<Thickness, number> = {
	[Thickness.Thick]: 0.16,
	[Thickness.Regular]: 0.08,
	[Thickness.Thin]: 0.04,
};

@Component({
	selector: 'loading-spinner',
	standalone: true,
	templateUrl: './loading-spinner.component.html',
	styleUrl: './loading-spinner.component.css',
})
export class LoadingSpinnerComponent {
	/**
	 * The thickness of the spinner.
	 * @type {Thickness}
	 */
	@Input()
	public thickness: Thickness = Thickness.Regular;

	/**
	 * The type of the spinner.
	 * @type {Type}
	 */
	@Input()
	public type: Type = Type.Rounded;

	/**
	 * Reference to the host element.
	 * @type {ElementRef<HTMLDivElement>}
	 */
	private readonly hostRef: ElementRef<HTMLDivElement>;

	/**
	 * Host binding for setting the thickness variable for CSS use.
	 * @type {string}
	 */
	@HostBinding('style.--thickness')
	private calculatedThickness!: string;

	/**
	 * Creates a new LoadingSpinnerComponent instance.
	 * @constructor
	 *
	 * @param   {ElementRef}              hostRef the entityManager
	 * @returns {LoadingSpinnerComponent}         the LoadingSpinnerComponent instance
	 */
	public constructor(hostRef: ElementRef) {
		this.hostRef = hostRef;
	}

	public ngAfterViewInit() {
		this.applyThickness();
	}

	public ngOnChanges() {
		this.applyThickness();
	}

	@HostBinding('class')
	get classList(): string {
		return `${this.thickness.toString()} ${this.type.toString()}`;
	}

	@HostListener('window:resize')
	private onResize() {
		this.applyThickness();
	}

	/**
	 * Calculate the thickness of the spinner based off its computed width.
	 *
	 * @param   {number} width the width of the component
	 * @returns {number}       the calculated thickness
	 */
	private calculateThickness(width: number) {
		return width * ThicknessMap[this.thickness];
	}

	/**
	 * Calculate the thickness, format for CSS and assign to host binding.
	 */
	private applyThickness() {
		this.calculatedThickness = `${this.calculateThickness(this.hostRef.nativeElement.clientWidth)}px`;
	}
}
