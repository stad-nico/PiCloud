import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateDirectoryInfo, ExplorerService } from 'src/app/core/components/explorer/explorer.service';
import { DirectoriesOnlyTree, ROOT_ID, TreeRoot, Type } from 'src/app/core/components/explorer/state/explorer.state';
import { PureDirectoryTreeComponent } from 'src/app/features/directory-tree/components/pure-directory-tree/pure-directory-tree.component';
import { DirectoryTreeService } from 'src/app/features/directory-tree/directory-tree.service';

@Component({
	standalone: true,
	selector: 'directory-tree',
	styleUrl: './directory-tree.component.css',
	templateUrl: './directory-tree.component.html',
	imports: [PureDirectoryTreeComponent],
})
export class DirectoryTreeComponent {
	private readonly service: DirectoryTreeService;

	private readonly explorerService: ExplorerService;

	private readonly showCreateDirectoryInfo$: Observable<CreateDirectoryInfo>;

	private readonly directoryId$: Observable<string>;

	private readonly root$: Observable<TreeRoot>;

	private readonly tree$: Observable<DirectoriesOnlyTree>;

	private readonly expandedIds$: Observable<Array<string>>;

	private readonly selectedId$: Observable<string>;

	public root!: TreeRoot;

	public tree!: DirectoriesOnlyTree;

	public expandedIds: Array<string> = [];

	public showCreateDirectoryComponent: boolean = false;

	public selectedId: string = ROOT_ID;

	public constructor(service: DirectoryTreeService, explorerService: ExplorerService) {
		this.service = service;
		this.explorerService = explorerService;

		this.showCreateDirectoryInfo$ = explorerService.getCreateDirectoryInfo();
		this.directoryId$ = explorerService.getDirectory();
		this.root$ = service.getRoot();
		this.tree$ = explorerService.getDirectoriesOnlyTree();
		this.expandedIds$ = service.getExpandedIds();
		this.selectedId$ = service.getSelectedId();
	}

	ngOnInit() {
		this.showCreateDirectoryInfo$.subscribe((info) => (this.showCreateDirectoryComponent = info.showCreateDirectoryComponent && info.isRoot));

		// this.directoryId$.pipe(take(1)).subscribe((id) => this.service.fetchInitialContent(id));

		this.expandedIds$.subscribe((ids) => (this.expandedIds = ids));

		this.directoryId$.subscribe((id) => this.service.select(id));

		this.root$.subscribe((node) => (this.root = node));

		this.tree$.subscribe((tree) => (this.tree = tree));

		this.selectedId$.subscribe((id) => (this.selectedId = id));
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
		this.explorerService.open(id, Type.Directory);
	}
}
