import { $ } from '@/util/dom.ts';
import { Data } from '@/data/data-object.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { UI } from './ui-window.ts';

UI.Reference = class ReferenceElement extends UI.Element {
	_prefabId = undefined;
	_synchronous = undefined;
	historyEnabled = false;
	prefab = null;
	paths = {};

	constructor(data: any) {
		super(data);
		this.paths[data.presetId] = true;
		this.prefabId = data.prefabId;
		this.synchronous = data.synchronous;
	}

	get prefabId() {
		return this._prefabId;
	}

	set prefabId(value: any) {
		if (this._prefabId !== value) {
			const firstTime = this._prefabId === undefined;
			this._prefabId = value;
			this.clear();
			const preset = Data.uiPresets[value];
			if (preset && preset.data.class !== 'reference') {
				this.loadElement(preset.data, this);
				if (this.children.length !== 0) {
					this.prefab = this.children[0];
					UI.root.addReference(this.prefab);
					if (this.synchronous) {
						this.lockTransform();
						this.setToPrefabSize();
					} else {
						this.unlockTransform();
						if (!firstTime) {
							this.setToPrefabSize();
						}
					}
				}
			}
		}
	}

	get synchronous() {
		return this._synchronous;
	}

	set synchronous(value: any) {
		if (this._synchronous !== value) {
			this._synchronous = value;
			if (value) {
				this.lockTransform();
				this.setToPrefabSize();
			} else {
				this.unlockTransform();
			}
		}
	}

	setToPrefabSize() {
		if (!this.prefab) return;
		const sTransform = this.transform;
		const dTransform = this.prefab.node.transform;
		const changes = [];
		for (const key of Object.keys(dTransform)) {
			switch (key) {
				case 'x':
				case 'x2':
				case 'y':
				case 'y2':
					continue;
			}
			if (sTransform[key] !== dTransform[key]) {
				if (this.historyEnabled) {
					changes.push({
						input: $(`#uiElement-transform-${key}`),
						oldValue: sTransform[key],
						newValue: dTransform[key]
					});
				}
				sTransform[key] = dTransform[key];
			}
		}
		if (changes.length !== 0) {
			UI.history.save({
				type: 'inspector-change',
				editor: Inspector.uiElement,
				target: this.node,
				changes: changes
			});
		}
		if (Inspector.uiElement.target === this.node) {
			Inspector.uiElement.write(sTransform);
		}
		this.resize();
	}

	loadElement(node: any, parent: any) {
		const { presetId } = node;
		const { paths } = parent;
		if (!(presetId in paths)) {
			const element = UI.createElement(node, false);
			element.paths = Object.create(paths);
			element.paths[presetId] = true;
			parent.appendChild(element);
			for (const child of node.children) {
				this.loadElement(child, element);
			}
		}
	}

	update() {
		this.prefab.destroyChildren();
		this.prefab.children.length = 0;
		for (const node of this.prefab.node.children) {
			this.loadElement(node, this.prefab);
		}
	}

	draw() {
		this.drawChildren();
	}

	lockTransform() {
		if (this.prefab) {
			const parent = this;
			const transform = this.transform;
			this.prefab.transform = new (class Transform {
				get anchorX() {
					return 0;
				}
				set anchorX(value: any) {
					transform.anchorX = value;
					parent.resize();
				}
				get anchorY() {
					return 0;
				}
				set anchorY(value: any) {
					transform.anchorY = value;
					parent.resize();
				}
				get x() {
					return 0;
				}
				set x(value: any) {}
				get x2() {
					return 0;
				}
				set x2(value: any) {}
				get y() {
					return 0;
				}
				set y(value: any) {}
				get y2() {
					return 0;
				}
				set y2(value: any) {}
				get width() {
					return 0;
				}
				set width(value: any) {
					transform.width = value;
					parent.resize();
				}
				get width2() {
					return 1;
				}
				set width2(value: any) {
					transform.width2 = value;
					parent.resize();
				}
				get height() {
					return 0;
				}
				set height(value: any) {
					transform.height = value;
					parent.resize();
				}
				get height2() {
					return 1;
				}
				set height2(value: any) {
					transform.height2 = value;
					parent.resize();
				}
				get rotation() {
					return 0;
				}
				set rotation(value: any) {
					transform.rotation = value;
					parent.resize();
				}
				get scaleX() {
					return 1;
				}
				set scaleX(value: any) {
					transform.scaleX = value;
					parent.resize();
				}
				get scaleY() {
					return 1;
				}
				set scaleY(value: any) {
					transform.scaleY = value;
					parent.resize();
				}
				get skewX() {
					return 0;
				}
				set skewX(value: any) {
					transform.skewX = value;
					parent.resize();
				}
				get skewY() {
					return 0;
				}
				set skewY(value: any) {
					transform.skewY = value;
					parent.resize();
				}
				get opacity() {
					return 1;
				}
				set opacity(value: any) {
					transform.opacity = value;
					parent.resize();
				}
			})();
		}
		if (Inspector.uiElement.target === this.node) {
			Inspector.uiElement.lockSizeInputs();
		}
	}

	unlockTransform() {
		if (this.prefab) {
			this.prefab.transform = new (class Transform {
				get anchorX() {
					return 0;
				}
				set anchorX(value: any) {}
				get anchorY() {
					return 0;
				}
				set anchorY(value: any) {}
				get x() {
					return 0;
				}
				set x(value: any) {}
				get x2() {
					return 0;
				}
				set x2(value: any) {}
				get y() {
					return 0;
				}
				set y(value: any) {}
				get y2() {
					return 0;
				}
				set y2(value: any) {}
				get width() {
					return 0;
				}
				set width(value: any) {}
				get width2() {
					return 1;
				}
				set width2(value: any) {}
				get height() {
					return 0;
				}
				set height(value: any) {}
				get height2() {
					return 1;
				}
				set height2(value: any) {}
				get rotation() {
					return 0;
				}
				set rotation(value: any) {}
				get scaleX() {
					return 1;
				}
				set scaleX(value: any) {}
				get scaleY() {
					return 1;
				}
				set scaleY(value: any) {}
				get skewX() {
					return 0;
				}
				set skewX(value: any) {}
				get skewY() {
					return 0;
				}
				set skewY(value: any) {}
				get opacity() {
					return 1;
				}
				set opacity(value: any) {}
			})();
		}
		if (Inspector.uiElement.target === this.node) {
			Inspector.uiElement.unlockSizeInputs();
		}
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
		this.clear();
	}

	clear() {
		if (this.prefab) {
			this.getRoot().removeReference(this.prefab);
			this.prefab = null;
			this.destroyChildren();
			this.children.length = 0;
		}
	}

	getRoot() {
		if (UI.root) return UI.root;
		let element = this.parent;
		while (!(element instanceof UI.Root)) {
			element = element.parent;
		}
		return element;
	}
};
