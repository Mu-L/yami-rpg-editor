import { Local } from '@/tools/localization.ts';
import { Window } from '@/tools/window-object.ts';

interface ListWithElements {
	elements: HTMLElement[] & { count: number };
	addNodeTo: (item: any, dItem: any) => void;
	deleteNode: (item: any) => void;
	select: (item: any) => void;
	copy?: (item: any) => void;
	paste?: (dItem: any) => void;
	delete?: (item: any) => void;
}

interface IdModule {
	idMap: Record<string, any>;
	createId: () => string;
}

interface ClosePanelModule {
	closePropertyPanel?: () => void;
	closeContentPanel?: () => void;
}

export interface ListClipboardConfig {
	module: IdModule & ClosePanelModule;
	list: ListWithElements;
	clipboardKey: string;
}

export function bindListClipboardMethods(config: ListClipboardConfig) {
	const { module, list, clipboardKey } = config;
	const closePanel = () => {
		if (module.closePropertyPanel) module.closePropertyPanel();
		else if (module.closeContentPanel) module.closeContentPanel();
	};

	list.copy = function (item: any) {
		if (item && item.class !== 'folder') {
			(globalThis as any).Clipboard.write(clipboardKey, item);
		}
	};

	list.paste = function (dItem: any) {
		const copy = (globalThis as any).Clipboard.read(clipboardKey);
		if (copy) {
			if (module.idMap[copy.id]) {
				copy.id = module.createId();
				copy.name += ' - Copy';
			}
			this.addNodeTo(copy, dItem);
		}
	};

	list.delete = function (item: any) {
		if (item) {
			const get = Local.createGetter('confirmation');
			Window.confirm(
				{
					message: get('deleteSingleFile').replace('<filename>', item.name)
				},
				[
					{
						label: get('yes'),
						click: () => {
							const elements = this.elements;
							const index = elements.indexOf(item.element);
							this.deleteNode(item);
							closePanel();
							const last = elements.count - 1;
							const element = elements[Math.min(index, last)];
							if (element instanceof HTMLElement) {
								this.select(element.item);
							}
						}
					},
					{
						label: get('no')
					}
				]
			);
		}
	};
}
