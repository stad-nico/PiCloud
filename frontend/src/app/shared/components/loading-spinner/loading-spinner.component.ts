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
	private readonly hostRef: ElementRef<HTMLDivElement>;

	@Input()
	thickness: Thickness = Thickness.Regular;

	@Input()
	type: Type = Type.Rounded;

	@HostBinding('style.--thickness')
	calculatedThickness!: string;

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

	private calculateThickness(actualWidth: number) {
		return actualWidth * ThicknessMap[this.thickness];
	}

	private applyThickness() {
		this.calculatedThickness = `${this.calculateThickness(this.hostRef.nativeElement.clientWidth)}px`;
	}
}
