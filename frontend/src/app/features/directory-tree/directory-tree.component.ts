import { Component } from '@angular/core';
import { Observable, skip, take } from 'rxjs';
import { CreateDirectoryInfo, ExplorerService } from 'src/app/core/components/explorer/explorer.service';
import { PureDirectoryTreeComponent } from 'src/app/features/directory-tree/components/pure-directory-tree/pure-directory-tree.component';
import { DirectoryTreeService } from 'src/app/features/directory-tree/directory-tree.service';
import { Node, TreeModel } from 'src/app/features/directory-tree/state/directory-tree.state';

@Component({
	standalone: true,
	selector: 'directory-tree',
	styleUrl: './directory-tree.component.css',
	templateUrl: './directory-tree.component.html',
	imports: [PureDirectoryTreeComponent],
})
export class DirectoryTreeComponent {
	private readonly service: DirectoryTreeService;

	private readonly showCreateDirectoryInfo$: Observable<CreateDirectoryInfo>;

	private readonly directoryId$: Observable<string>;

	private readonly root$: Observable<Node>;

	private readonly tree$: Observable<TreeModel>;

	public root!: Node;

	public tree!: TreeModel;

	public showCreateDirectoryComponent: boolean = false;

	public constructor(service: DirectoryTreeService, explorerService: ExplorerService) {
		this.service = service;

		this.showCreateDirectoryInfo$ = explorerService.getCreateDirectoryInfo();
		this.directoryId$ = explorerService.getDirectory();
		this.root$ = service.getRoot();
		this.tree$ = service.getTree();
	}

	ngOnInit() {
		this.showCreateDirectoryInfo$.subscribe((info) => (this.showCreateDirectoryComponent = info.showCreateDirectoryComponent && info.isRoot));

		this.directoryId$.pipe(take(1)).subscribe((id) => this.service.fetchInitialContent(id));

		this.directoryId$.pipe(skip(1)).subscribe((id) => this.service.open(id));

		this.root$.subscribe((node) => (this.root = node));

		this.tree$.subscribe((tree) => (this.tree = tree));
	}

	public onExpand(id: string) {
		this.service.expand(id);
	}

	public onCollapse(id: string) {
		this.service.collapse(id);
	}

	public onLoadContent(id: string) {
		this.service.fetchContent(id);
	}

	public onSelect(id: string) {
		this.service.open(id);
	}
}
