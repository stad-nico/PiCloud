import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { Node } from 'src/app/features/directory-tree/state/directory-tree.state';
import { LoadingSpinnerComponent, Thickness } from 'src/app/shared/components/loading-spinner/loading-spinner.component';

@Component({
	selector: 'directory-tree-item',
	standalone: true,
	templateUrl: './directory-tree-item.component.html',
	styleUrl: './directory-tree-item.component.css',
	imports: [LoadingSpinnerComponent],
})
export class DirectoryTreeItemComponent {
	@Input({ required: true })
	public node!: Node;

	@Input({ required: true })
	public tree!: {
		[path: string]: Array<Node>;
	};

	@Input()
	public isRoot: boolean = false;

	@HostBinding('class.is-collapsed')
	public isCollapsed!: boolean;

	@HostBinding('class.has-children')
	public hasChildren!: boolean;

	@HostBinding('class.is-loading')
	public isLoading!: boolean;

	@HostBinding('class.is-selected')
	public isSelected!: boolean;

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
		this.isCollapsed = this.node.isCollapsed;
		this.hasChildren = this.node.hasChildren;
		this.isSelected = this.node.isSelected;

		this.isLoading = this.hasChildren && !this.tree[this.node.id];
	}

	ngOnChanges() {
		this.isCollapsed = this.node.isCollapsed;
		this.hasChildren = this.node.hasChildren;
		this.isSelected = this.node.isSelected;

		this.isLoading = this.hasChildren && !this.tree[this.node.id];
	}

	public onArrowClick(event: MouseEvent | PointerEvent) {
		event.stopPropagation();

		if (this.isLoading) {
			this.onLoadContent.emit(this.node.id);
		}

		if (this.isCollapsed) {
			this.onExpand.emit(this.node.id);
		} else {
			this.onCollapse.emit(this.node.id);
		}
	}

	public onClick(event: MouseEvent | PointerEvent) {
		if (this.isRoot) {
			return;
		}

		event.stopPropagation();

		this.onSelect.emit(this.node.id);
		this.onLoadContent.emit(this.node.id);
	}
}
