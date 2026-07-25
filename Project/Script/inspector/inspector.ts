import { $ } from '@/util/dom.ts';
import '../components/element-methods.js';

import { MarqueeArea } from '@/components/marquee-area.ts';
import { Window } from '@/tools/window-object.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Log } from '@/log/log-window.ts';
import { History } from '@/tools/history.ts';
import { Cursor } from '@/tools/pointer-object.ts';
import { ParamListHistory } from '@/components/param-history.ts';

export const Inspector = {
	manager: null,
	type: null,
	meta: null,
	fileScene: null,
	fileUI: null,
	fileAnimation: null,
	fileParticle: null,
	fileTileset: null,
	fileActor: null,
	fileSkill: null,
	fileTrigger: null,
	fileItem: null,
	fileEquipment: null,
	fileState: null,
	fileEvent: null,
	fileImage: null,
	fileAudio: null,
	fileVideo: null,
	fileFont: null,
	fileScript: null,
	sceneActor: null,
	sceneRegion: null,
	sceneLight: null,
	sceneAnimation: null,
	sceneParticle: null,
	sceneParallax: null,
	sceneTilemap: null,
	uiElement: null,
	uiImage: null,
	uiText: null,
	uiTextBox: null,
	uiDialogBox: null,
	uiProgressBar: null,
	uiButton: null,
	uiAnimation: null,
	uiVideo: null,
	uiWindow: null,
	uiContainer: null,
	uiReference: null,
	animMotion: null,
	animJointLayer: null,
	animJointFrame: null,
	animSpriteLayer: null,
	animSpriteFrame: null,
	animParticleLayer: null,
	animParticleFrame: null,
	animSoundLayer: null,
	animSoundFrame: null,
	particleLayer: null,
	initialize: null,
	open: null,
	close: null,
	getKey: null,
	inspectorResize: null,
	managerKeydown: null,
	scrollPointerdown: null,
	inputFocus: null,
	inputBlur: null,
	sliderFocus: null,
	sliderBlur: null,
	ParamHistory: null
};

Inspector.initialize = function () {
	this.manager = $('#inspector-page-manager');
	this.manager.focusing = null;
	this.manager.oldValue = null;
	this.manager.listenDraggingScrollbarEvent(this.scrollPointerdown, {
		capture: true
	});

	// this.manager.switch('fileTrigger')

	History.processors['inspector-change'] = (operation, data) => {
		const { editor, target, changes } = data;
		for (const change of changes) {
			const input = change.input;
			const value = operation === 'undo' ? change.oldValue : change.newValue;
			if (editor.target === target) {
				input.write(value);
				input.dispatchEvent(new Event('input'));
			} else {
				const key = Inspector.getKey(input);
				editor.update(target, key, value);
			}
		}
		editor.owner?.setTarget(target);
	};
	History.processors['inspector-layer-change'] = (operation, data) => {
		const { target, motion, direction } = data;
		History.processors['inspector-change'](operation, data);
		Animation.setMotion(motion);
		Animation.setDirection(direction);
		Animation.openLayer(target);
	};
	History.processors['inspector-frame-change'] = (operation, data) => {
		const { target, motion, direction } = data;
		History.processors['inspector-change'](operation, data);
		Animation.setMotion(motion);
		Animation.setDirection(direction);
		Animation.selectFrame(target);
	};
	History.processors['inspector-param-insert'] = (operation, data) => {
		const { history, target } = data;
		const { owner, list } = history;
		ParamListHistory.restore(list, data, 'insert', operation);
		owner.setTarget(target);
		owner.planToSave();
	};
	History.processors['inspector-param-replace'] = (operation, data) => {
		const { history, target } = data;
		const { owner, list } = history;
		ParamListHistory.restore(list, data, 'replace', operation);
		owner.setTarget(target);
		owner.planToSave();
	};
	History.processors['inspector-param-delete'] = (operation, data) => {
		const { history, target } = data;
		const { owner, list } = history;
		ParamListHistory.restore(list, data, 'delete', operation);
		owner.setTarget(target);
		owner.planToSave();
	};
	History.processors['inspector-param-toggle'] = (operation, data) => {
		const { history, target } = data;
		const { owner, list } = history;
		ParamListHistory.restore(list, data, 'toggle', operation);
		owner.setTarget(target);
		owner.planToSave();
	};
	History.processors['script-parameter-change'] = (operation, data) => {
		const { editor, target, meta, list, parameters, key, value } = data;
		data.value = parameters[key];
		parameters[key] = value;
		if (editor.target === target) {
			list.rewrite(parameters, key);
		}
		editor.owner.setTarget(target, meta);
	};

	$('#inspector').on('resize', this.inspectorResize);
	this.manager.on('keydown', this.managerKeydown);

	this.fileScene.initialize();
	this.fileUI.initialize();
	this.fileAnimation.initialize();
	this.fileTileset.initialize();
	this.fileActor.initialize();
	this.fileSkill.initialize();
	this.fileTrigger.initialize();
	this.fileItem.initialize();
	this.fileEquipment.initialize();
	this.fileState.initialize();
	this.fileEvent.initialize();
	this.fileImage.initialize();
	this.fileAudio.initialize();
	this.fileVideo.initialize();
	this.fileFont.initialize();
	this.fileScript.initialize();
	this.sceneActor.initialize();
	this.sceneRegion.initialize();
	this.sceneLight.initialize();
	this.sceneAnimation.initialize();
	this.sceneParticle.initialize();
	this.sceneParallax.initialize();
	this.sceneTilemap.initialize();
	this.uiElement.initialize();
	this.uiImage.initialize();
	this.uiText.initialize();
	this.uiTextBox.initialize();
	this.uiDialogBox.initialize();
	this.uiProgressBar.initialize();
	this.uiButton.initialize();
	this.uiAnimation.initialize();
	this.uiVideo.initialize();
	this.uiWindow.initialize();
	this.uiReference.initialize();
	this.animMotion.initialize();
	this.animJointFrame.initialize();
	this.animSpriteLayer.initialize();
	this.animSpriteFrame.initialize();
	this.animParticleLayer.initialize();
	this.animParticleFrame.initialize();
	this.animSoundLayer.initialize();
	this.animSoundFrame.initialize();
	this.particleLayer.initialize();
};

Inspector.open = function (type, target, meta) {
	if (this.manager.contains(document.activeElement)) {
		document.activeElement.blur();
	}
	if (this.type !== type) {
		if (this.type !== null) {
			this[this.type].close();
		}
		this.type = type;
		this.manager.switch(type);
	}
	if (target) {
		this.meta = meta || null;
		this[type].open(target, meta);
	} else {
		this.close();
	}
};

Inspector.close = function (type) {
	if (this.manager.contains(document.activeElement)) {
		document.activeElement.blur();
	}
	if (type === undefined) {
		type = this.type || undefined;
	}
	if (this.type === type) {
		this[this.type].close();
		this.type = null;
		this.meta = null;
		this.manager.switch(null);
	}
};

Inspector.getKey = function (element) {
	let key = element.key;
	if (key === undefined) {
		const id = element.id;
		const index = id.indexOf('-') + 1;
		key = element.key = id.slice(index);
	}
	return key;
};

Inspector.inspectorResize = (function IIFE() {
	const resize = new Event('resize');
	return function (event) {
		const page = Inspector.manager.active;
		if (page instanceof HTMLElement) {
			page.dispatchEvent(resize);
		}
	};
})();

Inspector.managerKeydown = function (event) {
	const element = event.target;
	switch (element.tagName) {
		case 'INPUT':
		case 'TEXTAREA':
			// 如果是滑动框类型则跳到default
			if (element.type !== 'range') {
				if (event.cmdOrCtrlKey) {
					switch (event.code) {
						case 'KeyS':
							break;
						default:
							event.stopPropagation();
							break;
					}
				} else {
					switch (event.code) {
						case 'Escape':
						case 'F1':
						case 'F2':
						case 'F3':
						case 'F4':
							break;
						default:
							event.stopPropagation();
							break;
					}
				}
				break;
			}
		default:
			if (event.cmdOrCtrlKey) {
				switch (event.code) {
					case 'KeyZ':
					case 'KeyY':
						if (Inspector.manager.focusing) {
							document.activeElement.blur();
						}
						break;
				}
			}
	}
};

Inspector.scrollPointerdown = function (event) {
	if (this.dragging) {
		return;
	}
	switch (event.button) {
		case 0:
			if (event.altKey && !(event.target instanceof MarqueeArea)) {
				let element = event.target;
				while (element !== this) {
					if (element.scrollPointerup && element.hasScrollBar()) {
						return;
					}
					element = element.parentNode;
				}
				event.preventDefault();
				event.stopImmediatePropagation();
				this.dragging = event;
				event.mode = 'scroll';
				event.scrollLeft = this.scrollLeft;
				event.scrollTop = this.scrollTop;
				Cursor.open('cursor-grab');
				window.on('pointerup', this.scrollPointerup);
				window.on('pointermove', this.scrollPointermove);
			}
			break;
	}
};

Inspector.inputFocus = function (event) {
	if (Window.activeElement === null) {
		const { manager } = Inspector;
		if (manager.focusing !== null) {
			const id1 = manager.focusing.id;
			const id2 = this.id;
			return Log.throw(new Error(`Inspector focus error: ${id1} -> ${id2}`));
		}
		manager.focusing = this;
		manager.oldValue = this.read();
	}
};

Inspector.inputBlur = function (editor, owner, callback = null) {
	return function (event) {
		if (Window.activeElement === null) {
			// 因此需要判断manager.focusing
			const { manager } = Inspector;
			if (manager.focusing === null) {
				return;
			}
			const target = editor.target;
			const oldValue = manager.oldValue;
			const newValue = this.read();
			if (target !== null) {
				const changes = [];
				if (oldValue !== newValue) {
					changes.push({
						input: this,
						oldValue: oldValue,
						newValue: newValue
					});
				}
				if (this.changes) {
					changes.push(...this.changes);
				}
				if (changes.length !== 0) {
					const data = {
						type: 'inspector-change',
						editor: editor,
						target: target,
						changes: changes
					};
					owner.history.save(data);
					callback?.(data);
				}
			}
			if (this.changes) {
				delete this.changes;
			}
			manager.focusing = null;
			manager.oldValue = null;
		}
	};
};

Inspector.sliderFocus = (function IIFE() {
	const focus = new FocusEvent('focus');
	return function (event) {
		this.synchronizer.dispatchEvent(focus);
	};
})();

Inspector.sliderBlur = (function IIFE() {
	const blur = new FocusEvent('blur');
	return function (event) {
		this.synchronizer.dispatchEvent(blur);
	};
})();

Inspector.ParamHistory = class ParamHistory {
	editor: any;
	owner: any;
	list: any;

	constructor(editor: any, owner: any, list: any) {
		this.editor = editor;
		this.owner = owner;
		this.list = list;
	}

	reset() {}

	save(data: any) {
		const { target } = this.editor;
		if (target !== null) {
			switch (data.type) {
				case 'insert':
					data.type = 'inspector-param-insert';
					break;
				case 'replace':
					data.type = 'inspector-param-replace';
					break;
				case 'delete':
					data.type = 'inspector-param-delete';
					break;
				case 'toggle':
					data.type = 'inspector-param-toggle';
					break;
			}
			data.history = this;
			data.target = target;
			this.owner.history.save(data);
		}
	}

	restore(operation: any) {
		this.owner.history.restore(operation);
	}

	canUndo() {
		const history = this.owner.history;
		const data = history[history.index];
		return data?.type.indexOf('inspector-param') === 0;
	}

	canRedo() {
		const history = this.owner.history;
		const data = history[history.index + 1];
		return data?.type.indexOf('inspector-param') === 0;
	}
};
