import { Path } from '../util/config.ts';
import { Editor } from './editor.ts';

Editor.updatePath = function (path) {
	const { config } = this;

	config.project = path;

	config.dialogs.open = Path.dirname(path);

	const items = config.recent;
	const date = Date.now();
	const item = items.find((a) => a.path === path);
	if (item) {
		item.date = date;
		items.remove(item);
		items.unshift(item);
	} else {
		items.unshift({ path, date });
		while (items.length > 3) {
			items.pop();
		}
	}
};
