import { Data } from '../data/data-object.ts';
import { File } from '../file/file-system-core.ts';
import { Codec } from '../codec/codec.ts';
import { Layout } from '../layout/layout.ts';
import { Editor } from '../main/editor.ts';
import { Scene } from './scene-window.ts';
import { Local } from '../tools/localization.ts';
// 列表 - 复制
Scene.list.copy = function (item) {
	if (item) {
		switch (item.class) {
			case 'tilemap':
				Codec.encodeTilemap(item);
				break;
		}
		(Clipboard as any).write('yami.scene.object', item);
	}
};

// 列表 - 粘贴
Scene.list.paste = function (dItem, callback) {
	const copy = (Clipboard as any).read('yami.scene.object');
	if (copy && this.data) {
		switch (copy.class) {
			case 'tilemap':
				Codec.decodeTilemap(copy);
				copy.shortcut = 0;
				break;
		}
		if (dItem === 'auto') {
			const folders = Editor.project.scene.defaultFolders;
			const name = folders[copy.class];
			dItem = !name
				? null
				: this.getItemByProperties({
						class: 'folder',
						name: name
					});
		}
		callback?.(copy);
		this.addNodeTo(copy, dItem);
		Scene.requestRendering();
	}
};

// 列表 - 创建副本
Scene.list.duplicate = function (item) {
	let copy;
	switch (item.class) {
		case 'tilemap':
			Codec.encodeTilemap(item);
			copy = Object.clone(item);
			Codec.decodeTilemap(copy);
			copy.shortcut = 0;
			break;
		default:
			copy = Object.clone(item);
			break;
	}
	copy.name = this.generateUniqueName(item);
	const index = item.parent.children.indexOf(item);
	const next = item.parent.children[index + 1];
	if (next) {
		this.addNodeTo(copy, next, true);
	} else {
		this.addNodeTo(copy, item.parent);
	}
};

// 列表 - 删除
Scene.list.delete = function (item) {
	if (item) {
		this.deleteNode(item);
	}
};

// 列表 - 开关对象
Scene.list.toggle = function (item) {
	if (item && 'enabled' in item) {
		Scene.history.save({
			type: 'scene-object-toggle',
			item: item,
			oldValue: item.enabled,
			newValue: !item.enabled
		});
		item.enabled = !item.enabled;
		this.updateConditionIcon(item);
		this.dispatchChangeEvent();
		Scene.requestRendering();
	}
};

// 列表 - 取消搜索
Scene.list.cancelSearch = function () {
	if (this.display === 'search') {
		const active = document.activeElement;
		Scene.searcher.deleteInputContent();
		this.expandToSelection();
		this.scrollToSelection();
		active.focus();
	}
};

// 列表 - 创建文件夹
Scene.list.createFolder = function () {
	return {
		class: 'folder',
		name: 'New Folder',
		expanded: false,
		hidden: true,
		locked: true,
		children: []
	};
};

// 列表 - 创建瓦片地图快捷方式菜单选项
Scene.list.createTilemapShortcutItems = function (tilemap) {
	const { shortcuts } = Scene.tilemaps;
	const { shortcut } = tilemap;
	const menuItems = [];
	for (let i = 0; i < 7; i++) {
		const target = shortcuts[i];
		const checked = shortcut === i;
		const click = () => {
			if (shortcut !== i) {
				tilemap.shortcut = i;
				shortcuts.update();
				Scene.planToSave();
				Scene.history.save({
					type: 'scene-tilemap-shortcut',
					tilemap: tilemap,
					shortcut: shortcut
				});
			}
		};
		if (i === 0) {
			menuItems.push({
				label: Local.get('menuSceneList.shortcut.none'),
				checked: checked,
				click: click
			});
		} else {
			menuItems.push({
				label: `${i}: ${target?.name ?? ''}`,
				enabled: !target || checked,
				checked: checked,
				click: click
			});
		}
	}
	return menuItems;
};

// 列表 - 恢复递归状态
Scene.list.restoreRecursiveStates = (function IIFE() {
	const restore = (node, key, states, index) => {
		if (node[key] !== undefined) {
			node[key] = states[index++];
		}
		// 兼容动画图层列表
		const children = node.children;
		if (children !== undefined) {
			const length = children.length;
			for (let i = 0; i < length; i++) {
				index = restore(children[i], key, states, index);
			}
		}
		return index;
	};
	return function (item, key, states) {
		return restore(item, key, states, 0);
	};
})();

// 列表 - 设置递归状态
Scene.list.setRecursiveStates = (function IIFE() {
	const set = (node, key, state, backups) => {
		if (node[key] !== undefined) {
			backups.push(node[key]);
			node[key] = state;
		}
		// 兼容动画图层列表
		const children = node.children;
		if (children !== undefined) {
			const length = children.length;
			for (let i = 0; i < length; i++) {
				set(children[i], key, state, backups);
			}
		}
		return backups;
	};
	return function (item, key, state) {
		return set(item, key, state, []);
	};
})();

// 列表 - 更新项目类名
Scene.list.updateItemClass = function (item) {
	if (item.class !== 'folder') {
		item.element.addClass('reference');
	} else {
		item.element.removeClass('reference');
	}
};

// 列表 - 更新文件夹状态
Scene.list.updateFolderState = (function IIFE() {
	let key;
	const list = Scene.list;
	const check = (item) => {
		if (item.class === 'folder') {
			update(item);
		}
	};
	const toggle = (folder) => {
		folder[key] = !folder[key];
		// 撤销重做时无法控制列表的更新顺序
		// 所以在这里手动刷新元素图标
		switch (key) {
			case 'hidden':
				list.updateVisibilityIcon(folder);
				break;
			case 'locked':
				list.updateLockIcon(folder);
				break;
		}
		check(folder.parent);
	};
	const update = (folder) => {
		const items = folder.children;
		const state = folder[key];
		if (state) {
			for (const item of items) {
				if (item[key] === false) {
					toggle(folder);
					return;
				}
			}
		} else {
			for (const item of items) {
				if (item[key] === false) {
					return;
				}
			}
			toggle(folder);
		}
	};
	return function (item, iKey) {
		key = iKey;
		return check(item);
	};
})();

// 列表 - 判断是否可以开关状态
// 因为可视和锁定状态自动更新导致了历史操作可能无法正确还原
// 锁死不包含场景对象的文件夹是为了保证撤消重做结果的正确性
Scene.list.canSwitchState = (function IIFE() {
	const check = (item) => {
		if (item.class === 'folder') {
			for (const child of item.children) {
				if (check(child)) return true;
			}
			return false;
		}
		return true;
	};
	return function (item) {
		return check(item);
	};
})();

// 列表 - 重写创建图标方法
Scene.list.createIcon = (function IIFE() {
	// 图标创建函数集合
	const iconCreators = {
		folder: () => {
			const icon = document.createElement('node-icon');
			icon.addClass('icon-folder');
			return icon;
		},
		actor: (actor) => {
			const teams = Data.teams.map;
			const team = teams[actor.teamId];
			const hex = team ? team.color : 'ffffffff';
			const r = parseInt(hex.slice(0, 2), 16);
			const g = parseInt(hex.slice(2, 4), 16);
			const b = parseInt(hex.slice(4, 6), 16);
			const a = parseInt(hex.slice(6, 8), 16) / 255;
			const icon = document.createElement('node-icon');
			icon.textContent = '\uf2c0';
			icon.style.color = `rgba(${r}, ${g}, ${b}, ${a})`;
			return icon;
		},
		region: (region) => {
			const hex = region.color;
			const r = parseInt(hex.slice(0, 2), 16);
			const g = parseInt(hex.slice(2, 4), 16);
			const b = parseInt(hex.slice(4, 6), 16);
			const a = parseInt(hex.slice(6, 8), 16) / 255;
			const icon = document.createElement('node-icon');
			icon.addClass('icon-scene-region');
			icon.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
			return icon;
		},
		light: (light) => {
			const icon = document.createElement('node-icon');
			const r = light.red;
			const g = light.green;
			const b = light.blue;
			icon.textContent = '\uf006';
			icon.style.color = `rgba(${r}, ${g}, ${b})`;
			return icon;
		},
		animation: () => {
			const icon = document.createElement('node-icon');
			icon.textContent = '\uf110';
			return icon;
		},
		particle: () => {
			const icon = document.createElement('node-icon');
			icon.textContent = '\uf2dc';
			return icon;
		},
		parallax: (parallax) => {
			const icon = document.createElement('node-icon');
			const path = File.getPath(parallax.image);
			if (path) {
				icon.addClass('icon-scene-parallax');
				icon.style.backgroundImage = CSS.encodeURL(File.route(path));
			} else {
				icon.textContent = '\uf1c5';
			}
			return icon;
		},
		tilemap: () => {
			const icon = document.createElement('node-icon');
			icon.textContent = '\uf00a';
			return icon;
		}
	};
	return function (item) {
		return iconCreators[item.class](item);
	};
})();

// 列表 - 更新图标
Scene.list.updateIcon = function (item) {
	const { element } = item;
	if (element?.nodeIcon) {
		const icon = this.createIcon(item);
		element.replaceChild(icon, element.nodeIcon);
		element.nodeIcon = icon;
	}
};

// 列表 - 更新头部位置
Scene.list.updateHead = function () {
	const { page, head } = this;
	if (page.clientWidth !== 0) {
		// 调整左边位置
		const { nav } = Layout.getGroupOfElement(head);
		const nRect = nav.rect();
		const iRect = nav.lastChild.rect();
		const left = iRect.right - nRect.left;
		if (head.left !== left) {
			head.left = left;
			head.style.left = `${left}px`;
		}
	}
};

// 列表 - 更新瓦片地图的类名
Scene.list.updateTilemapClass = function (item) {
	if (item === Scene.tilemap) {
		item.element.addClass('highlight');
	}
};

// 列表 - 创建条件图标
Scene.list.createConditionIcon = function (item) {
	if (item.conditions instanceof Array) {
		const { element } = item;
		const conditionIcon = document.createElement('node-icon');
		conditionIcon.addClass('icon-conditional');
		element.appendChild(conditionIcon);
		element.conditionIcon = conditionIcon;
		element.condition = '';
	}
};

// 列表 - 更新条件图标
Scene.list.updateConditionIcon = function (item) {
	const { element } = item;
	if (element.conditionIcon !== undefined) {
		const condition = item.enabled
			? item.conditions.length !== 0
				? 'conditional'
				: 'none'
			: 'absent';
		if (element.condition !== condition) {
			element.condition = condition;
			const icon = element.conditionIcon;
			switch (condition) {
				case 'none':
					element.removeClass('weak');
					icon.hide();
					break;
				case 'conditional':
					element.removeClass('weak');
					icon.textContent = '?';
					icon.show();
					break;
				case 'absent':
					element.addClass('weak');
					icon.textContent = '!';
					icon.show();
					break;
			}
		}
	}
};

// 列表 - 创建事件图标
Scene.list.createEventIcon = function (item) {
	if (item.events instanceof Array) {
		const { element } = item;
		const eventIcon = document.createElement('node-icon');
		eventIcon.addClass('icon-eventEnabled');
		eventIcon.textContent = 'E';
		element.appendChild(eventIcon);
		element.eventIcon = eventIcon;
		element.eventEnabled = null;
	}
};

// 列表 - 更新事件图标
Scene.list.updateEventIcon = function (item) {
	const { element } = item;
	if (element.eventIcon !== undefined) {
		const eventEnabled = item.events.length !== 0;
		if (element.eventEnabled !== eventEnabled) {
			element.eventEnabled = eventEnabled;
			eventEnabled ? element.eventIcon.show() : element.eventIcon.hide();
		}
	}
};

// 列表 - 创建脚本图标
Scene.list.createScriptIcon = function (item) {
	if (item.scripts instanceof Array) {
		const { element } = item;
		const scriptIcon = document.createElement('node-icon');
		scriptIcon.addClass('icon-scriptEnabled');
		scriptIcon.textContent = '\uf121';
		element.appendChild(scriptIcon);
		element.scriptIcon = scriptIcon;
		element.scriptEnabled = null;
	}
};

// 列表 - 更新脚本图标
Scene.list.updateScriptIcon = function (item) {
	const { element } = item;
	if (element.scriptIcon !== undefined) {
		const scriptEnabled = item.scripts.length !== 0;
		if (element.scriptEnabled !== scriptEnabled) {
			element.scriptEnabled = scriptEnabled;
			scriptEnabled
				? element.scriptIcon.show()
				: element.scriptIcon.hide();
		}
	}
};

// 列表 - 创建可见性图标
Scene.list.createVisibilityIcon = function (item) {
	const { element } = item;
	const hiddenIcon = document.createElement('visibility-icon');
	element.appendChild(hiddenIcon);
	element.hiddenIcon = hiddenIcon;
	// 使用hiddenState来避开原生属性hidden
	element.hiddenState = null;
};

// 列表 - 更新可见性图标
Scene.list.updateVisibilityIcon = function (item) {
	const { element } = item;
	if (element.hiddenState !== item.hidden) {
		const { hiddenIcon } = element;
		if ((element.hiddenState = item.hidden)) {
			hiddenIcon.textContent = '\uf070';
			hiddenIcon.addClass('node-icon-highlight');
		} else {
			hiddenIcon.textContent = '\uf06e';
			hiddenIcon.removeClass('node-icon-highlight');
		}
	}
};

// 列表 - 创建锁定图标
Scene.list.createLockIcon = function (item) {
	const { element } = item;
	const lockIcon = document.createElement('lock-icon');
	element.appendChild(lockIcon);
	element.lockIcon = lockIcon;
	element.lockState = null;
};

// 列表 - 更新锁定图标
Scene.list.updateLockIcon = function (item) {
	const { element } = item;
	if (element.lockState !== item.locked) {
		const { lockIcon } = element;
		if ((element.lockState = item.locked)) {
			lockIcon.textContent = '\uf023';
			lockIcon.addClass('node-icon-highlight');
		} else {
			lockIcon.textContent = '\uf09c';
			lockIcon.removeClass('node-icon-highlight');
		}
	}
};

// 列表 - 在创建数据时回调
Scene.list.onCreate = function (item) {
	if (item.class === 'folder') return;
	Scene.registerPreset(item);
	Scene.loadObjects();
	Scene.loadObjectContext(item);
	Scene.requestRendering();
};

// 列表 - 在迁移数据时回调
Scene.list.onRemove = function () {
	Scene.loadObjects();
	Scene.requestRendering();
};

// 列表 - 在删除数据时回调
Scene.list.onDelete = function (item) {
	Scene.unregisterPreset(item);
	Scene.updateTarget();
	Scene.loadObjects();
	Scene.destroyObjectContext(item);
	Scene.requestRendering();
};

// 列表 - 在恢复数据时回调
Scene.list.onResume = function (item) {
	Scene.registerPreset(item);
	Scene.loadObjects();
	Scene.reloadObjectContext(item);
	Scene.requestRendering();
};

import path from 'node:path';
