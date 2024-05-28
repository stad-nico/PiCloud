import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { DirectoryService } from 'generated';
import { Observable } from 'rxjs';
import { PathState } from 'src/components/app/actions/path';
import { GetTreeSubDirectories } from 'src/components/app/actions/tree.state';

@Component({
	standalone: true,
	selector: 'create-directory-component',
	templateUrl: './CreateDirectoryComponent.html',
	styleUrl: './CreateDirectoryComponent.css',
	imports: [FormsModule],
})
export class CreateDirectoryComponent {
	constructor(
		private directoryService: DirectoryService,
		private store: Store,
		private router: Router,
		private elRef: ElementRef
	) {}

	@Output()
	removeEmitter = new EventEmitter<void>();

	@Input()
	indent: boolean = true;

	validChars = `[a-zA-Z-0-9\u00c4\u00e4\u00d6\u00f6\u00dc\u00fc\u00df]`;

	directoryNameRegex = new RegExp(`^([-_.]?${this.validChars})([-_. ]?${this.validChars})*$`, 'mi');

	isNameInvalid: boolean = false;

	name!: string;

	@Select(PathState.path)
	path$!: Observable<string>;

	path!: string;

	@ViewChild('input')
	inputElement!: ElementRef;

	loading: boolean = false;

	ngOnInit() {
		this.path$.subscribe((path) => {
			this.path = path;
		});

		document.body.onmousedown = (e) => {
			if (!(this.elRef.nativeElement.contains(e.target) || this.elRef.nativeElement === e.target)) {
				this.removeEmitter.emit();
			}
		};
	}

	ngAfterViewInit() {
		this.inputElement.nativeElement.focus();
	}

	onEnter() {
		if (this.isNameInvalid) {
			return;
		}

		this.loading = true;

		this.directoryService.createDirectory(this.path + '/' + this.name).subscribe({
			next: () => {
				this.store.dispatch(new GetTreeSubDirectories(this.path)).subscribe(() => {
					this.loading = false;
					this.removeEmitter.emit();
					this.router.navigate([this.path, this.name]);
				});
			},
			error: (error) => {
				this.loading = false;
			},
		});
	}

	onNameChange() {
		this.isNameInvalid = !this.directoryNameRegex.test(this.name);
	}
}
