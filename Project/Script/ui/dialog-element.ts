import { UI } from './ui-window.ts';

UI.DialogBox = class DialogBoxElement extends UI.Text {
	constructor(data: any) {
		super({
			...data,
			direction: 'horizontal-tb',
			horizontalAlign: 'left',
			verticalAlign: 'top',
			overflow: 'wrap-truncate'
		});
	}
};
