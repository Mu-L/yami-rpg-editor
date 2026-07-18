'use strict'
import { Window } from '../tools/window-object.js'
import { UI } from './ui-window.js'

// ******************************** 容器元素 ********************************

UI.Container = class ContainerElement extends UI.Element {
	// 绘制图像
	draw() {
		this.drawChildren()
	}

	// 调整大小
	resize() {
		if (this.parent instanceof UI.Window) {
			return this.parent.requestResizing()
		}
		this.calculatePosition()
		this.resizeChildren()
	}

	// 销毁元素
	destroy() {
		super.destroy()
		this.destroyChildren()
	}
}
