import { ServiceCollection } from "src/client/common/services/Service.js";
import { UserInterfaceService, IUserInterfaceService } from "src/client/common/services/UserInterfaceService.js";
import { LayoutType } from "src/client/common/ui/Layout.js";

export interface IApplication {
	userInterfaceService: IUserInterfaceService;
}

export abstract class Application extends ServiceCollection implements IApplication {
	/**
	 * UserInterfaceService that handles ui (events & creation)
	 */
	public userInterfaceService: IUserInterfaceService;

	/**
	 * Creates a new Application instance
	 */
	protected constructor(layoutType: LayoutType) {
		super();

		this.userInterfaceService = new UserInterfaceService(layoutType);
		this.registerService(this.userInterfaceService);
	}
}