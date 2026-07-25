import { UI } from './ui-window.ts';

UI.Container = class ContainerElement extends UI.Element {
	draw() {
		this.drawChildren();
	}

	resize() {
		if (this.parent instanceof UI.Window) {
			return this.parent.requestResizing();
		}
		this.calculatePosition();
		this.resizeChildren();
	}

	destroy() {
		super.destroy();
		this.destroyChildren();
	}
};
