import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { DirectoriesOnlyTree, Directory, ROOT_ID, TreeRoot } from 'src/app/core/components/explorer/state/explorer.state';
import { LoadingSpinnerComponent, Thickness } from 'src/app/shared/components/loading-spinner/loading-spinner.component';

@Component({
	selector: 'directory-tree-item',
	standalone: true,
	templateUrl: './directory-tree-item.component.html',
	styleUrl: './directory-tree-item.component.css',
	imports: [LoadingSpinnerComponent],
})
export class DirectoryTreeItemComponent {
	@Input()
	public tree: DirectoriesOnlyTree = {};

	@Input()
	public isRoot: boolean = false;

	@Input()
	public expandedIds: Array<string> = [];

	@Input()
	public root!: TreeRoot;

	@Input()
	public data!: Directory;

	@Input()
	@HostBinding('class.is-collapsed')
	public isCollapsed: boolean = true;

	@Input()
	@HostBinding('class.has-children')
	public hasChildren: boolean = false;

	@HostBinding('class.is-loading')
	public isLoading: boolean = false;

	@Input()
	@HostBinding('class.is-selected')
	public isSelected: boolean = false;

	@Input()
	public selectedId: string = ROOT_ID;

	@Output()
	public onLoadContent: EventEmitter<string> = new EventEmitter();

	@Output()
	public onCollapse: EventEmitter<string> = new EventEmitter();

	@Output()
	public onExpand: EventEmitter<string> = new EventEmitter();

	@Output()
	public onSelect: EventEmitter<string> = new EventEmitter();

	public loadingSpinnerThickness = Thickness.Thick;

	ngOnInit() {
		if (this.data) {
			this.isLoading = this.hasChildren && !this.tree[this.data.id];
		}
	}

	ngOnChanges() {
		if (this.data) {
			this.isLoading = this.hasChildren && !this.tree[this.data.id];
		}
	}

	public onArrowClick(event: MouseEvent | PointerEvent) {
		event.stopPropagation();

		if (this.isLoading) {
			this.onLoadContent.emit(this.data.id);
		}

		if (this.isCollapsed) {
			this.onExpand.emit(this.data.id);
		} else {
			this.onCollapse.emit(this.data.id);
		}
	}

	public onClick(event: MouseEvent | PointerEvent) {
		if (this.isRoot) {
			return;
		}

		event.stopPropagation();

		this.onSelect.emit(this.data.id);
		this.onLoadContent.emit(this.data.id);
	}
}
