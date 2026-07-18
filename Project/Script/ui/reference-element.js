'use strict'
import { $ } from '../util/dom.js'
import { Data } from '../data/data-object.js'
import { Inspector } from '../inspector/inspector.js'
import { UI } from './ui-window.js'

// ******************************** 引用元素 ********************************

UI.Reference = class ReferenceElement extends UI.Element {
	_prefabId = undefined
	_synchronous = undefined
	historyEnabled = false
	prefab = null
	paths = {}

	constructor(data) {
		super(data)
		this.paths[data.presetId] = true
		this.prefabId = data.prefabId
		this.synchronous = data.synchronous
	}

	// 读取预制件ID
	get prefabId() {
		return this._prefabId
	}

	// 写入预制件ID
	set prefabId(value) {
		if (this._prefabId !== value) {
			const firstTime = this._prefabId === undefined
			this._prefabId = value
			this.clear()
			const preset = Data.uiPresets[value]
			if (preset && preset.data.class !== 'reference') {
				// 加载被引用的元素
				this.loadElement(preset.data, this)
				if (this.children.length !== 0) {
					this.prefab = this.children[0]
					UI.root.addReference(this.prefab)
					if (this.synchronous) {
						this.lockTransform()
						this.setToPrefabSize()
					} else {
						this.unlockTransform()
						if (!firstTime) {
							this.setToPrefabSize()
						}
					}
				}
			}
		}
	}

	// 读取同步开关
	get synchronous() {
		return this._synchronous
	}

	// 写入同步开关
	set synchronous(value) {
		if (this._synchronous !== value) {
			this._synchronous = value
			if (value) {
				this.lockTransform()
				this.setToPrefabSize()
			} else {
				this.unlockTransform()
			}
		}
	}

	// 设置为预制件大小
	setToPrefabSize() {
		if (!this.prefab) return
		const sTransform = this.transform
		const dTransform = this.prefab.node.transform
		const changes = []
		for (const key of Object.keys(dTransform)) {
			switch (key) {
				case 'x':
				case 'x2':
				case 'y':
				case 'y2':
					continue
			}
			if (sTransform[key] !== dTransform[key]) {
				if (this.historyEnabled) {
					changes.push({
						input: $(`#uiElement-transform-${key}`),
						oldValue: sTransform[key],
						newValue: dTransform[key]
					})
				}
				sTransform[key] = dTransform[key]
			}
		}
		if (changes.length !== 0) {
			UI.history.save({
				type: 'inspector-change',
				editor: Inspector.uiElement,
				target: this.node,
				changes: changes
			})
		}
		if (Inspector.uiElement.target === this.node) {
			Inspector.uiElement.write(sTransform)
		}
		this.resize()
	}

	// 加载元素
	loadElement(node, parent) {
		const { presetId } = node
		const { paths } = parent
		if (!(presetId in paths)) {
			const element = UI.createElement(node, false)
			element.paths = Object.create(paths)
			element.paths[presetId] = true
			parent.appendChild(element)
			for (const child of node.children) {
				this.loadElement(child, element)
			}
		}
	}

	// 更新
	update() {
		this.prefab.destroyChildren()
		this.prefab.children.length = 0
		for (const node of this.prefab.node.children) {
			this.loadElement(node, this.prefab)
		}
	}

	// 绘制图像
	draw() {
		this.drawChildren()
	}

	// 锁定元素大小
	lockTransform() {
		if (this.prefab) {
			const parent = this
			const transform = this.transform
			this.prefab.transform = new (class Transform {
				get anchorX() {
					return 0
				}
				set anchorX(value) {
					transform.anchorX = value
					parent.resize()
				}
				get anchorY() {
					return 0
				}
				set anchorY(value) {
					transform.anchorY = value
					parent.resize()
				}
				get x() {
					return 0
				}
				set x(value) {}
				get x2() {
					return 0
				}
				set x2(value) {}
				get y() {
					return 0
				}
				set y(value) {}
				get y2() {
					return 0
				}
				set y2(value) {}
				get width() {
					return 0
				}
				set width(value) {
					transform.width = value
					parent.resize()
				}
				get width2() {
					return 1
				}
				set width2(value) {
					transform.width2 = value
					parent.resize()
				}
				get height() {
					return 0
				}
				set height(value) {
					transform.height = value
					parent.resize()
				}
				get height2() {
					return 1
				}
				set height2(value) {
					transform.height2 = value
					parent.resize()
				}
				get rotation() {
					return 0
				}
				set rotation(value) {
					transform.rotation = value
					parent.resize()
				}
				get scaleX() {
					return 1
				}
				set scaleX(value) {
					transform.scaleX = value
					parent.resize()
				}
				get scaleY() {
					return 1
				}
				set scaleY(value) {
					transform.scaleY = value
					parent.resize()
				}
				get skewX() {
					return 0
				}
				set skewX(value) {
					transform.skewX = value
					parent.resize()
				}
				get skewY() {
					return 0
				}
				set skewY(value) {
					transform.skewY = value
					parent.resize()
				}
				get opacity() {
					return 1
				}
				set opacity(value) {
					transform.opacity = value
					parent.resize()
				}
			})()
		}
		if (Inspector.uiElement.target === this.node) {
			Inspector.uiElement.lockSizeInputs()
		}
	}

	// 取消锁定元素大小
	unlockTransform() {
		if (this.prefab) {
			this.prefab.transform = new (class Transform {
				get anchorX() {
					return 0
				}
				set anchorX(value) {}
				get anchorY() {
					return 0
				}
				set anchorY(value) {}
				get x() {
					return 0
				}
				set x(value) {}
				get x2() {
					return 0
				}
				set x2(value) {}
				get y() {
					return 0
				}
				set y(value) {}
				get y2() {
					return 0
				}
				set y2(value) {}
				get width() {
					return 0
				}
				set width(value) {}
				get width2() {
					return 1
				}
				set width2(value) {}
				get height() {
					return 0
				}
				set height(value) {}
				get height2() {
					return 1
				}
				set height2(value) {}
				get rotation() {
					return 0
				}
				set rotation(value) {}
				get scaleX() {
					return 1
				}
				set scaleX(value) {}
				get scaleY() {
					return 1
				}
				set scaleY(value) {}
				get skewX() {
					return 0
				}
				set skewX(value) {}
				get skewY() {
					return 0
				}
				set skewY(value) {}
				get opacity() {
					return 1
				}
				set opacity(value) {}
			})()
		}
		if (Inspector.uiElement.target === this.node) {
			Inspector.uiElement.unlockSizeInputs()
		}
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
		this.clear()
	}

	// 清除元素
	clear() {
		if (this.prefab) {
			this.getRoot().removeReference(this.prefab)
			this.prefab = null
			this.destroyChildren()
			this.children.length = 0
		}
	}

	// 获取根元素
	getRoot() {
		// 删除元素操作必须用这个获取
		if (UI.root) return UI.root
		// 关闭标签页后销毁用这个获取
		let element = this.parent
		while (!(element instanceof UI.Root)) {
			element = element.parent
		}
		return element
	}
}
