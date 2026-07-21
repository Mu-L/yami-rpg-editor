import { GL } from '../webgl/webgl-init.ts';
import { UI } from './ui-window.ts';

// ******************************** 根元素 ********************************

UI.Root = class RootElement extends UI.Element {
	background; //:number
	references = {};

	constructor() {
		super({
			transform: null,
			hidden: false
		});
		this.connected = true;
		this.background = null;
	}

	// 绘制图像
	draw() {
		GL.matrix.set(UI.matrix);
		GL.alpha = 1;
		GL.blend = 'normal';
		GL.fillRect(this.x, this.y, this.width, this.height, this.background);
		this.drawChildren();
	}

	// 调整大小
	resize() {
		this.x = 0;
		this.y = 0;
		this.width = UI.width;
		this.height = UI.height;
		this.background = UI.foreground.getINTRGBA();
		this.resizeChildren();
	}

	// 添加被引用的元素
	addReference(prefabElement) {
		const map = this.references;
		const id = prefabElement.node.presetId;
		if (map[id] === undefined) {
			map[id] = [];
		}
		map[id].append(prefabElement);
	}

	// 移除被引用的元素
	removeReference(prefabElement) {
		const map = this.references;
		const id = prefabElement.node.presetId;
		if (map[id] !== undefined) {
			map[id].remove(prefabElement);
		}
	}

	// 更新引用元素(通过变动的元素位置判断)
	tryUpdateReferenceElements(element) {
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

	// 销毁元素
	destroy() {
		this.destroyChildren();
	}
};
