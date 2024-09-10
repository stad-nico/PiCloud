import { Component, ElementRef, HostBinding, HostListener, Input } from '@angular/core';

export enum Type {
	Minimalistic = 'minimalistic',
	Rounded = 'rounded',
}

export enum Thickness {
	UltraThick = 'ultra-thick',
	Thick = 'thick',
	Regular = 'regular',
	Thin = 'thin',
}

const ThicknessMap: Record<Thickness, number> = {
	[Thickness.UltraThick]: 0.24,
	[Thickness.Thick]: 0.18,
	[Thickness.Regular]: 0.09,
	[Thickness.Thin]: 0.045,
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
	public thickness!: Thickness;

	/**
	 * The type of the spinner.
	 * @type {Type}
	 */
	@Input()
	public type!: Type;

	/**
	 * Reference to the host element.
	 * @type {ElementRef<HTMLDivElement>}
	 */
	private readonly hostRef: ElementRef<HTMLDivElement>;

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

	public apply() {
		this.applyDefaults();
		this.applyThickness();
	}

	public ngAfterContentInit() {
		this.apply();

		new ResizeObserver(() => this.applyThickness()).observe(this.hostRef.nativeElement);
	}

	public ngOnChanges() {
		this.apply();
	}

	@HostBinding('class')
	get classList(): string {
		return `${this.thickness.toString()} ${this.type.toString()}`;
	}

	@HostListener('window:resize')
	public onResize() {
		this.applyThickness();
	}

	private applyDefaults() {
		this.thickness = this.thickness || Thickness.Thick;
		this.type = this.type || Type.Rounded;
	}

	/**
	 * Calculate the thickness of the spinner based off its computed width.
	 *
	 * @param   {number} width the width of the component
	 * @returns {number}       the calculated thickness
	 */
	private calculateThickness(width: number) {
		return Math.round(width * ThicknessMap[this.thickness]);
	}

	/**
	 * Calculate the thickness, format for CSS and assign to host binding.
	 */
	private applyThickness() {
		let calculatedThickness = `${this.calculateThickness(this.hostRef.nativeElement.clientWidth)}px`;

		this.hostRef.nativeElement.style.setProperty('--thickness', calculatedThickness);
	}
}
