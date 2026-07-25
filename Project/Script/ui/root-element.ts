import { GL } from '../webgl/webgl-init.ts';
import { UI } from './ui-window.ts';

UI.Root = class RootElement extends UI.Element {
	background: number;
	references = {};

	constructor() {
		super({
			transform: null,
			hidden: false
		});
		this.connected = true;
		this.background = null;
	}

	draw() {
		GL.matrix.set(UI.matrix);
		GL.alpha = 1;
		GL.blend = 'normal';
		GL.fillRect(this.x, this.y, this.width, this.height, this.background);
		this.drawChildren();
	}

	resize() {
		this.x = 0;
		this.y = 0;
		this.width = UI.width;
		this.height = UI.height;
		this.background = UI.foreground.getINTRGBA();
		this.resizeChildren();
	}

	addReference(prefabElement: any) {
		const map = this.references;
		const id = prefabElement.node.presetId;
		if (map[id] === undefined) {
			map[id] = [];
		}
		map[id].append(prefabElement);
	}

	removeReference(prefabElement: any) {
		const map = this.references;
		const id = prefabElement.node.presetId;
		if (map[id] !== undefined) {
			map[id].remove(prefabElement);
		}
	}

	tryUpdateReferenceElements(element: any) {
		const map = this.references;
		while (element !== this) {
			const id = element.node.presetId;
			if (id in map) {
				for (const prefab of map[id]) {
					prefab.parent.update();
				}
			}
			element = element.parent;
		}
	}

	destroy() {
		this.destroyChildren();
	}
};
