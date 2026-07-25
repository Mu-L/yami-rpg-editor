import { $ } from '../util/dom.ts';
import { File } from '../file/file-system-core.ts';
import { Inspector } from '../inspector/inspector.ts';
import { GL } from '../webgl/webgl-init.ts';
import { Cursor } from '../tools/pointer-object.ts';
import { Animation } from '../animation/animation-window.ts';
import { Browser } from '../browser/project-browser.ts';
import { Palette } from '../palette/palette.ts';
import { Particle } from '../particle/particle-window.ts';
import { Scene } from '../scene/scene-window.ts';
import { Home } from '../title/home-page.ts';
import { Title } from '../title/title-bar.ts';
import { UI } from '../ui/ui-window.ts';

export const Layout = {
	manager: $('#workspace-page-manager'),
	items: null,
	heads: null,
	layouts: null,
	layout: null,
	default: null,
	dragging: null,
	resizing: null,
	focusableSelector: null,
	focusableElements: null,
	initialize: null,
	switchLayout: null,
	createGroups: null,
	updateGroups: null,
	updateGroupTabs: null,
	updateGroupInfo: null,
	mergeGroups: null,
	setGroupSize: null,
	computeSizesBefore: null,
	computeSizesAfter: null,
	updateHint: null,
	getKeyGroups: null,
	getGroupOfElement: null,
	readyToFocus: null,
	createGroupContent: null,
	createGroupBorder: null,
	enableFocusableElements: null,
	disableFocusableElements: null,
	saveNavStates: null,
	saveLayoutScheme: null,
	loadLayoutScheme: null,
	saveToConfig: null,
	loadFromConfig: null,
	windowResize: null,
	windowLocalize: null,
	pageSwitch: null,
	navWrite: null,
	navPointerdown: null,
	navDragstart: null,
	navDragend: null,
	navDragenter: null,
	navDragleave: null,
	navDragover: null,
	navDrop: null,
	regionDragleave: null,
	regionDragover: null,
	borderPointerdown: null,
	pointerup: null,
	pointermove: null
};

Layout.initialize = function () {
	const nav = $('#layout-nav');
	const manager = $('#layout-page-manager');
	const items = (this.items = {});
	for (const item of nav.childNodes) {
		const key = item.getAttribute('value');
		// 在初始化语言包之前清除标签内容 因为设置语言包可能会有几帧延时 item.lastChild.textContent = ''
		item.draggable = true;
		items[key] = item;
	}
	for (const page of manager.childNodes) {
		const key = page.getAttribute('value');
		items[key].page = page;
	}

	Object.defineProperty(items, 'list', {
		value: Object.values(items)
	});

	this.heads = [
		Scene.head,
		Scene.list.head,
		UI.head,
		UI.list.head,
		Animation.head,
		Animation.list.head,
		Animation.timeline.head,
		Browser.head,
		Palette.head
	];

	File.get({
		local: 'default.json',
		type: 'json'
	}).then((config) => {
		this.default = config.layout;
	});

	this.focusableSelector = `
  input, textarea, button, select-box, check-box, radio-box,
  color-box, custom-box, common-list, node-list, param-list,
  command-list, file-body-content`;

	window.on('resize', this.windowResize);
	window.on('localize', this.windowLocalize);
	this.manager.on('switch', this.pageSwitch);
};

Layout.switchLayout = function (layout) {
	this.layout = layout;
	const { manager } = this;
	for (const page of manager.childNodes) {
		if (page.scheme !== undefined) {
			delete page.scheme;
		}
	}
	const key = manager.index;
	if (layout[key] !== undefined) {
		this.loadLayoutScheme(key);
	}
};

Layout.createGroups = function (item, parent) {
	const group = document.createElement('group');
	parent.appendChild(group);
	if (item.children) {
		(
			group as HTMLElement & {
				end: any;
				split: any;
				tabs: any[];
				nav: HTMLElement;
				manager: any;
			}
		).end = item.end;
		(
			group as HTMLElement & {
				end: any;
				split: any;
				tabs: any[];
				nav: HTMLElement;
				manager: any;
			}
		).split = item.split;
		group.addClass(item.split);

		for (const child of item.children) {
			this.createGroups(child, group);
		}
	} else {
		const { end, tabs } = item;
		(
			group as HTMLElement & {
				end: any;
				split: any;
				tabs: any[];
				nav: HTMLElement;
				manager: any;
			}
		).end = end;
		(
			group as HTMLElement & {
				end: any;
				split: any;
				tabs: any[];
				nav: HTMLElement;
				manager: any;
			}
		).tabs = tabs;
		this.createGroupContent(group);

		const nav = (
			group as HTMLElement & {
				end: any;
				split: any;
				tabs: any[];
				nav: HTMLElement;
				manager: any;
			}
		).nav;
		const manager = (
			group as HTMLElement & {
				end: any;
				split: any;
				tabs: any[];
				nav: HTMLElement;
				manager: any;
			}
		).manager;
		for (const tab of tabs) {
			const item = this.items[tab];
			nav.appendChild(item);
			manager.appendChild(item.page);
		}
	}

	this.createGroupBorder(group);
};

Layout.updateGroups = (function IIFE() {
	const update = (group, split, start) => {
		const end = group.end;
		const style = group.style;
		switch (split) {
			case 'horizontal': {
				const pn = group.parentNode;
				const pw = pn.clientWidth;
				const sl = CSS.rasterize(pw * start);
				const sr = CSS.rasterize(pw * end);
				style.left = `${sl}px`;
				style.top = '0';
				style.width = `${sr - sl}px`;
				style.height = '100%';
				break;
			}
			case 'vertical': {
				const pn = group.parentNode;
				const ph = pn.clientHeight;
				const st = CSS.rasterize(ph * start);
				const sb = CSS.rasterize(ph * end);
				style.left = '0';
				style.top = `${st}px`;
				style.width = '100%';
				style.height = `${sb - st}px`;
				break;
			}
			case 'full':
				style.left = '0';
				style.top = '0';
				style.width = '100%';
				style.height = '100%';
				break;
		}
		if (group.split) {
			const split = group.split;
			let start = 0;
			for (const child of group.childNodes) {
				if (child.tagName === 'GROUP') {
					start = update(child, split, start);
				}
			}
		} else {
			const active = group.manager.active;
			const width = group.clientWidth;
			const height = group.clientHeight;
			const dpr = window.devicePixelRatio;
			if (
				active &&
				(active.dpr !== dpr || active.width !== width || active.height !== height)
			) {
				active.dpr = dpr;
				active.width = width;
				active.height = height;
				active.dispatchResizeEvent();
			}
		}
		return end;
	};
	return function (force) {
		switch (this.manager.index) {
			case null:
			case 'home':
				return;
		}
		const page = this.manager.active;
		const root = page.childNodes[0];
		const width = page.clientWidth;
		const height = page.clientHeight;
		const dpr = window.devicePixelRatio;
		if (
			width * height !== 0 &&
			(force || root.dpr !== dpr || root.width !== width || root.height !== height)
		) {
			root.dpr = dpr;
			root.width = width;
			root.height = height;
			update(root, 'full', 0);
		}
	};
})();

Layout.updateGroupTabs = function (group) {
	const tabs = [];
	for (const item of group.nav.childNodes) {
		tabs.push(item.getAttribute('value'));
	}
	group.tabs = tabs;
};

Layout.updateGroupInfo = function () {
	for (const info of this.resizing.infos) {
		const box = CSS.getDevicePixelContentBoxSize(info.manager);
		info.textContent = `${box.width} x ${box.height}`;
	}
};

Layout.mergeGroups = (function IIFE() {
	const merge = (outer) => {
		const nodes = outer.childNodes;
		let i = nodes.length;
		while (--i >= 0) {
			const inner = nodes[i];
			if (inner.split === outer.split) {
				const prev = inner.previousSibling;
				const gs = prev ? prev.end : 0;
				const ge = inner.end;
				const nodes = inner.childNodes;
				while (nodes.length > 1) {
					const node = nodes[0];
					const end = node.end;
					// 这是由于两次划分变成了一次划分 而每次划分都是取得近似的整数值
					if (end !== undefined) {
						node.end = Math.roundTo(gs * (1 - end) + ge * end, 6);
					}
					outer.insertBefore(node, inner);
				}
				inner.remove();
			}
		}
		for (const inner of nodes) {
			if (inner.split !== undefined) {
				merge(inner);
			}
		}
	};
	return function () {
		merge(this.manager.active.childNodes[0]);
	};
})();

Layout.setGroupSize = function (group, hint, direction) {
	const parent = group.parentNode;
	const prev = group.previousSibling;
	const next = group.nextSibling;
	let space;
	let size;
	switch (parent.split) {
		case 'horizontal':
			space = parent.clientWidth;
			size = group.clientLeft + hint.width;
			break;
		case 'vertical':
			space = parent.clientHeight;
			size = group.clientTop + hint.height;
			break;
	}
	if (next.tagName === 'GROUP') {
		size += 1;
	}
	if (space !== 0) {
		let end = size / space;
		switch (direction) {
			case 'forward':
				if (prev) {
					end = prev.end + end;
				}
				if (next === parent.border) {
					end = 1;
				}
				group.end = Math.roundTo(end, 6);
				this.computeSizesBefore(group);
				this.computeSizesAfter(group);
				break;
			case 'backward':
				if (prev) {
					end = group.end - end;
					prev.end = Math.roundTo(end, 6);
					this.computeSizesBefore(prev);
					this.computeSizesAfter(prev);
				}
				break;
		}
	}
};

Layout.computeSizesBefore = function (group) {
	const parent = group.parentNode;
	const space =
		parent.split === 'horizontal'
			? parent.clientWidth
			: parent.split === 'vertical'
				? parent.clientHeight
				: 0;
	if (space !== 0) {
		const nodes = parent.childNodes;
		const index = Array.prototype.indexOf.call(nodes, group);
		const groups = Array.prototype.slice.call(nodes, 0, index + 1);
		const head = nodes[0];
		const length = groups.length;
		const min = Math.min(0.1, 32 / space);
		for (let i = length - 2, end = group.end; i >= 0; i--) {
			const group = groups[i];
			const pad = 2;
			end = Math.min(group.end, end - min - pad / space);
			end = Math.roundTo(end, 6);
			group.end = end;
		}
		for (let i = 0, end = 0; i < length; i++) {
			const group = groups[i];
			const pad = (group === head ? 0 : 1) + 1;
			end = Math.max(group.end, end + min + pad / space);
			end = Math.roundTo(end, 6);
			group.end = end;
		}
	}
};

Layout.computeSizesAfter = function (group) {
	const parent = group.parentNode;
	const space =
		parent.split === 'horizontal'
			? parent.clientWidth
			: parent.split === 'vertical'
				? parent.clientHeight
				: 0;
	if (space !== 0) {
		const nodes = parent.childNodes;
		const index = Array.prototype.indexOf.call(nodes, group);
		const groups = Array.prototype.slice.call(nodes, index, -1);
		const foot = nodes[nodes.length - 2];
		const last = groups.length - 1;
		const min = Math.min(0.1, 32 / space);
		for (let i = 0, end = 0; i < last; i++) {
			const group = groups[i];
			const pad = 2;
			end = Math.max(group.end, end + min + pad / space);
			end = Math.roundTo(end, 6);
			group.end = end;
		}
		for (let i = last - 1, end = 1; i >= 0; i--) {
			const group = groups[i];
			const pad = (groups[i + 1] === foot ? 0 : 1) + 1;
			end = Math.min(group.end, end - min - pad / space);
			end = Math.roundTo(end, 6);
			group.end = end;
		}
	}
};

Layout.updateHint = function (location) {
	const { dragging } = this;
	const { hint } = dragging;
	if (dragging.location) {
		const { trigger } = dragging.location;
		if (trigger.tagName === 'NAV-ITEM') {
			trigger.removeClass('drag-entered');
		}
	}
	if ((dragging.location = location)) {
		const { group } = dragging;
		const { trigger } = location;
		const { target } = location;
		const { direction } = location;
		const gw = group.clientWidth;
		const gh = group.clientHeight;
		const rect = target.rect();
		let x = target.clientLeft + rect.left;
		let y = target.clientTop + rect.top;
		let w = target.clientWidth;
		let h = target.clientHeight;
		switch (direction) {
			case 'inside':
				break;
			case 'top':
				h = Math.min(h / 2 - 1, gh);
				break;
			case 'bottom':
				y = y + h;
				h = Math.min(h / 2 - 1, gh);
				y = y - h;
				break;
			case 'left':
				w = Math.min(w / 2 - 1, gw);
				break;
			case 'right':
				x = x + w;
				w = Math.min(w / 2 - 1, gw);
				x = x - w;
				break;
		}
		if (trigger.tagName === 'NAV-ITEM') {
			trigger.addClass('drag-entered');
		}
		document.body.appendChild(hint);
		hint.set({
			left: x,
			top: y,
			width: w,
			height: h
		});
	} else {
		hint.remove();
	}
};

Layout.getKeyGroups = (function IIFE() {
	const find = (list, node) => {
		if (node.split !== undefined) {
			for (const group of node.childNodes) {
				if (group.tagName === 'GROUP') {
					find(list, group);
				}
			}
		} else if (node.tagName === 'GROUP') {
			list.push(node);
		}
		return list;
	};
	return function () {
		return find([], this.manager.active.childNodes[0]);
	};
})();

Layout.getGroupOfElement = function (element) {
	while ((element = element.parentNode)) {
		if (element.tagName === 'GROUP') {
			return element;
		}
	}
	return null;
};

// 准备获得焦点 在获得焦点之前给群组添加ready-to-focus类来防止闪烁
Layout.readyToFocus = function (element) {
	const group = this.getGroupOfElement(element);
	if (group) {
		group.addClass('ready-to-focus');
		setTimeout(() => {
			group.removeClass('ready-to-focus');
			element.focus();
		});
	}
};

Layout.createGroupContent = function (group) {
	const nav = document.createElement('nav-bar');
	nav.on('write', this.navWrite);
	nav.on('pointerdown', this.navPointerdown);
	nav.on('dragstart', this.navDragstart);
	nav.on('dragend', this.navDragend);
	group.appendChild(nav);

	const manager = document.createElement('page-manager');
	manager.addClass('group-manager');
	group.appendChild(manager);

	group.nav = nav;
	group.manager = manager;
};

Layout.createGroupBorder = function (group) {
	const border = document.createElement('group-border');
	border.on('pointerdown', this.borderPointerdown);
	group.appendChild(border);

	group.border = border;
};

Layout.enableFocusableElements = function () {
	const elements = this.focusableElements;
	if (elements) {
		for (const element of elements) {
			if (element.clientWidth !== 0) {
				element.tabIndex += 1;
			}
		}
		this.focusableElements = null;
	}
};

Layout.disableFocusableElements = function () {
	const { active } = this.manager;
	if (active) {
		const nodes = [];
		const selector = this.focusableSelector;
		const elements = active.querySelectorAll(selector);
		for (const element of elements) {
			if (element.clientWidth !== 0) {
				element.tabIndex -= 1;
				nodes.push(element);
			}
		}
		// 因为禁用情况下可能会创建新元素(脚本参数) 因此记录已修改的元素再进行恢复更安全
		this.focusableElements = nodes;
	}
};

Layout.saveNavStates = function () {
	for (const item of this.items.list) {
		if (item.hasClass('selected')) {
			const nav = item.parentNode;
			nav.lastValue = item.dataValue;
			nav.write(null);
		}
	}
};

Layout.saveLayoutScheme = (function IIFE() {
	const read = (data, group) => {
		if (group.split !== undefined) {
			const children = [];
			data.end = group.end;
			data.split = group.split;
			data.children = children;
			for (const childNode of group.childNodes) {
				if (childNode !== group.border) {
					const subdata = {};
					read(subdata, childNode);
					children.push(subdata);
				}
			}
		} else {
			data.end = group.end;
			data.tabs = group.tabs;
		}
		return data;
	};
	return function (rootGroup) {
		return read({}, rootGroup);
	};
})();

Layout.loadLayoutScheme = function (key) {
	const scheme = Layout.layout[key];
	const page = this.manager.active;
	if (page.scheme !== scheme) {
		page.scheme = scheme;
		this.createGroups(scheme, page.clear());
		this.updateGroups();
		const groups = this.getKeyGroups();
		for (const group of groups) {
			group.nav.write(group.tabs[0]);
		}
	} else {
		const items = this.items;
		const groups = this.getKeyGroups();
		for (const group of groups) {
			const { tabs, nav, manager } = group;
			for (const tab of tabs) {
				const item = items[tab];
				nav.appendChild(item);
				manager.appendChild(item.page);
			}
		}
		this.updateGroups(true);
		for (const { nav } of groups) {
			nav.write(nav.lastValue);
		}
	}
};

Layout.saveToConfig = function (config) {
	const { layout } = this;
	for (const page of this.manager.childNodes) {
		const key = page.getAttribute('value');
		if (page.scheme !== undefined && page.scheme === layout[key]) {
			const root = page.childNodes[0];
			layout[key] = this.saveLayoutScheme(root);
		}
	}
	config.layout = layout;
};

Layout.loadFromConfig = function (config) {
	this.layout = config.layout;
};

Layout.windowResize = function (event) {
	Layout.updateGroups();
};

Layout.windowLocalize = function (event) {
	if (Layout.manager.active !== null) {
		for (const group of Layout.getKeyGroups()) {
			group.manager.active.dispatchResizeEvent();
		}
	}
};

Layout.pageSwitch = function (event) {
	switch (event.last) {
		case 'scene':
			Scene.save();
			Scene.close();
			break;
		case 'ui':
			UI.save();
			UI.close();
			break;
		case 'animation':
			Animation.save();
			Animation.close();
			break;
		case 'particle':
			Particle.save();
			Particle.close();
			break;
	}

	switch (event.last) {
		case 'directory':
		case 'scene':
		case 'ui':
		case 'animation':
		case 'particle':
			Layout.saveNavStates();
			break;
	}

	switch (event.value) {
		case 'scene': {
			const body = Scene.body;
			const target = body.firstChild;
			body.insertBefore(GL.canvas, target);
			break;
		}
		case 'ui': {
			const body = UI.body;
			const target = body.firstChild;
			body.insertBefore(GL.canvas, target);
			break;
		}
		case 'animation': {
			const body = Animation.body;
			const target = body.firstChild;
			body.insertBefore(GL.canvas, target);
			break;
		}
		case 'particle': {
			const body = Particle.body;
			const target = body.firstChild;
			body.insertBefore(GL.canvas, target);
			break;
		}
		default:
			GL.canvas.remove();
			break;
	}

	switch (event.value) {
		case 'home':
			Title.tabBar.removeClass('visible');
			Home.updateCenterPosition();
			Home.parseRecentProjects();
			break;
		case 'directory':
			Title.tabBar.addClass('visible');
			Title.tabBar.select(Title.tabBar.dirItem);
			Layout.loadLayoutScheme('directory');
			break;
		case 'scene':
			Title.tabBar.addClass('visible');
			Layout.loadLayoutScheme('scene');
			break;
		case 'ui':
			Title.tabBar.addClass('visible');
			Layout.loadLayoutScheme('ui');
			break;
		case 'animation':
			Title.tabBar.addClass('visible');
			Layout.loadLayoutScheme('animation');
			break;
		case 'particle':
			Title.tabBar.addClass('visible');
			Layout.loadLayoutScheme('particle');
			break;
		default:
			Title.tabBar.removeClass('visible');
			break;
	}
};

Layout.navWrite = function (event) {
	const index = event.value;
	this.parentNode.manager.switch(index);
};

Layout.navPointerdown = function (event) {
	switch (event.button) {
		case 0: {
			const element = event.target;
			if (element.tagName === 'NAV-ITEM' && element.hasClass('selected')) {
				switch (element.dataValue) {
					case 'inspector':
						Layout.readyToFocus(Inspector.manager);
						break;
					default: {
						const page = element.page;
						const nodes = page.querySelectorAll('[tabindex]');
						for (let i = nodes.length - 1; i >= 0; i--) {
							const node = nodes[i];
							if (node.clientWidth !== 0 && node.clientHeight !== 0) {
								Layout.readyToFocus(node);
								break;
							}
						}
						Layout.readyToFocus(page);
						break;
					}
				}
			}
			break;
		}
	}
};

Layout.navDragstart = function (event) {
	if (!Layout.dragging) {
		Layout.dragging = event;
		Object.defineProperty(event, 'clientX', { writable: true });
		Object.defineProperty(event, 'clientY', { writable: true });
		event.preventDefault = Function.empty;
		event.dataTransfer.hideDragImage();
		event.group = this.parentNode;
		event.hint = document.createElement('drag-and-drop-hint');
		event.hint.addClass('for-group');
		window.on('dragenter', Layout.navDragover);
		window.on('dragover', Layout.navDragover);
		const groups = Layout.getKeyGroups();
		const navs = (event.navs = []);
		const regions = (event.regions = []);
		for (const group of groups) {
			const nav = group.nav;
			nav.on('dragenter', Layout.navDragenter);
			nav.on('dragleave', Layout.navDragleave);
			nav.on('drop', Layout.navDrop);
			navs.push(nav);
			const region = document.createElement('group-region');
			region.on('dragleave', Layout.regionDragleave);
			region.on('dragover', Layout.regionDragover);
			region.on('drop', Layout.navDrop);
			group.appendChild(region);
			regions.push(region);
		}
		for (const head of Layout.heads) {
			head.style.pointerEvents = 'none';
		}
	}
};

Layout.navDragend = function (event) {
	const { dragging } = Layout;
	if (dragging) {
		window.off('dragenter', Layout.navDragover);
		window.off('dragover', Layout.navDragover);
		for (const nav of dragging.navs) {
			nav.off('dragenter', Layout.navDragenter);
			nav.off('dragleave', Layout.navDragleave);
			nav.off('drop', Layout.navDrop);
		}
		for (const region of dragging.regions) {
			region.off('dragleave', Layout.regionDragleave);
			region.off('dragover', Layout.regionDragover);
			region.off('drop', Layout.navDrop);
			region.remove();
		}
		for (const head of Layout.heads) {
			head.style.pointerEvents = '';
		}
		Layout.updateHint(null);
		Layout.dragging = null;
	}
};

Layout.navDragenter = function (event) {
	const { dragging } = Layout;
	if (dragging) {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
		const trigger = event.target;
		const target = this.parentNode;
		const sGroup = dragging.group;
		const sItem = dragging.target;
		const sNav = sGroup.nav;
		const sItems = sNav.childNodes;
		if (
			target !== sGroup ||
			(sItems.length > 1 &&
				trigger !== sItem &&
				!(trigger === sNav && sItem === sNav.lastChild) &&
				trigger !== sItem.nextSibling)
		) {
			Layout.updateHint({
				trigger: trigger,
				target: target,
				direction: 'inside'
			});
		} else {
			Layout.updateHint(null);
		}
	}
};

Layout.navDragleave = function (event) {
	const { dragging } = Layout;
	if (dragging && dragging.location && dragging.location.trigger === event.target) {
		Layout.updateHint(null);
	}
};

Layout.navDragover = function (event) {
	event.preventDefault();
	event.dataTransfer.dropEffect = 'move';
};

Layout.navDrop = function (event) {
	const { dragging } = Layout;
	if (!dragging) {
		return;
	}
	event.stopPropagation();
	if (dragging.location) {
		const sGroup = dragging.group;
		const item = dragging.target;
		const { hint } = dragging;
		const { location } = dragging;
		const { trigger } = location;
		const { target } = location;
		const { direction } = location;
		let parent = target.parentNode;
		let dGroup;
		let split;
		switch (direction) {
			case 'left':
			case 'right':
				split = 'horizontal';
				break;
			case 'top':
			case 'bottom':
				split = 'vertical';
				break;
		}

		if (split !== undefined && parent.split !== split) {
			parent.replaceChild((parent = document.createElement('group')), target);
			parent.end = target.end;
			parent.split = split;
			parent.addClass(split);
			parent.style.left = target.style.left;
			parent.style.top = target.style.top;
			parent.style.width = target.style.width;
			parent.style.height = target.style.height;
			parent.appendChild(target);
			target.end = 1;
			Layout.createGroupBorder(parent);
		}

		switch (direction) {
			case 'inside':
				dGroup = target;
				break;
			case 'left':
			case 'top':
				dGroup = document.createElement('group');
				parent.insertBefore(dGroup, target);
				Layout.createGroupContent(dGroup);
				Layout.createGroupBorder(dGroup);
				break;
			case 'right':
			case 'bottom':
				dGroup = document.createElement('group');
				dGroup.end = target.end;
				parent.insertBefore(dGroup, target.nextSibling);
				Layout.createGroupContent(dGroup);
				Layout.createGroupBorder(dGroup);
				break;
		}

		const sNav = sGroup.nav;
		const dNav = dGroup.nav;
		const sManager = sGroup.manager;
		const dManager = dGroup.manager;
		if (sNav !== dNav) {
			dNav.write(null);
			dManager.index = sManager.index;
			dManager.active = sManager.active;
			sManager.index = null;
			sManager.active = null;
		}

		const page = item.page;
		if (trigger.tagName === 'NAV-ITEM') {
			dNav.insertBefore(item, trigger);
			dManager.insertBefore(page, trigger.page);
		} else {
			dNav.appendChild(item);
			dManager.appendChild(page);
		}

		Layout.updateGroupTabs(sGroup);
		Layout.updateGroupTabs(dGroup);

		// 擦除页面的宽高属性 调整节点树后滚动条会重置 需要触发调整事件来恢复
		page.width = null;
		page.height = null;

		if (sNav !== dNav) {
			if (sNav.hasChildNodes()) {
				sNav.write(sNav.childNodes[0].getAttribute('value'));
			} else {
				const pGroup = sGroup.parentNode;
				const prev = sGroup.previousSibling;
				const next = sGroup.nextSibling;
				const border = pGroup.border;
				const nodes = pGroup.childNodes;
				if (prev && next === border) {
					prev.end = 1;
				}
				sGroup.remove();

				if (nodes.length === 2) {
					nodes[0].end = pGroup.end;
					pGroup.parentNode.replaceChild(nodes[0], pGroup);
				}
			}

			switch (direction) {
				case 'left':
				case 'top':
					Layout.mergeGroups();
					Layout.setGroupSize(dGroup, hint, 'forward');
					break;
				case 'right':
				case 'bottom':
					Layout.mergeGroups();
					Layout.setGroupSize(dGroup, hint, 'backward');
					break;
			}

			Layout.updateGroups(true);
			Layout.navPointerdown({
				button: 0,
				target: item
			});
		}
	}
};

Layout.regionDragleave = function (event) {
	const { dragging } = Layout;
	if (dragging && dragging.location && dragging.location.trigger === this) {
		Layout.updateHint(null);
	}
};

Layout.regionDragover = function (event) {
	const { dragging } = Layout;
	if ((dragging && dragging.clientX !== event.clientX) || dragging.clientY !== event.clientY) {
		dragging.clientX = event.clientX;
		dragging.clientY = event.clientY;
		const root = Layout.manager.active.childNodes[0];
		let target = this.parentNode;
		let parent = target.parentNode;
		let siblings = parent.childNodes;
		let direction;
		if (root.split) {
			const { x, y } = event.getRelativeCoords(root);
			const w = root.clientWidth;
			const h = root.clientHeight;
			const nodes = root.childNodes;
			const padding = 8;
			if (!direction && y < padding + 20) {
				direction = 'top';
				if (root.split === 'horizontal') {
					target = root;
				}
				if (root.split === 'vertical') {
					target = nodes[0];
				}
			}
			if (!direction && y > h - padding) {
				direction = 'bottom';
				if (root.split === 'horizontal') {
					target = root;
				}
				if (root.split === 'vertical') {
					target = nodes[nodes.length - 2];
				}
			}
			if (!direction && x < padding) {
				direction = 'left';
				if (root.split === 'horizontal') {
					target = nodes[0];
				}
				if (root.split === 'vertical') {
					target = root;
				}
			}
			if (!direction && x > w - padding) {
				direction = 'right';
				if (root.split === 'horizontal') {
					target = nodes[nodes.length - 2];
				}
				if (root.split === 'vertical') {
					target = root;
				}
			}
		}
		const { x, y } = event.getRelativeCoords(this);
		const w = this.clientWidth;
		const h = this.clientHeight;
		const n = Math.min(w, h) / 4;
		const l = n;
		const t = n;
		const r = w - n;
		const b = h - n;
		const padding = n / 3;
		if (!direction && x >= l && x < r && y >= t && y < b) {
			direction = 'center';
		}
		if (!direction && y < t) {
			const tan1 = Math.atan2(y, x);
			const tan2 = Math.atan2(y, x - w);
			if (tan1 < Math.PI * 0.25 && tan2 > Math.PI * 0.75) {
				direction = 'top';
				if (y < padding) {
					if (parent.split === 'horizontal') {
						target = parent;
					}
					if (parent.split === 'vertical' && target === siblings[0]) {
						const outer = parent.parentNode;
						if (outer.tagName === 'GROUP') {
							target = outer;
						}
					}
				}
			}
		}
		if (!direction && y >= b) {
			const tan1 = Math.atan2(y - h, x);
			const tan2 = Math.atan2(y - h, x - w);
			if (tan1 > -Math.PI * 0.25 && tan2 < -Math.PI * 0.75) {
				direction = 'bottom';
				if (y >= h - padding) {
					if (parent.split === 'horizontal') {
						target = parent;
					}
					if (parent.split === 'vertical' && target === siblings[siblings.length - 2]) {
						const outer = parent.parentNode;
						if (outer.tagName === 'GROUP') {
							target = outer;
						}
					}
				}
			}
		}
		if (!direction && x < l) {
			direction = 'left';
			if (x < padding) {
				if (parent.split === 'horizontal' && target === siblings[0]) {
					const outer = parent.parentNode;
					if (outer.tagName === 'GROUP') {
						target = outer;
					}
				}
				if (parent.split === 'vertical') {
					target = parent;
				}
			}
		}
		if (!direction && x >= r) {
			direction = 'right';
			if (x >= w - padding) {
				if (parent.split === 'horizontal' && target === siblings[siblings.length - 2]) {
					const outer = parent.parentNode;
					if (outer.tagName === 'GROUP') {
						target = outer;
					}
				}
				if (parent.split === 'vertical') {
					target = parent;
				}
			}
		}
		switch (direction) {
			case 'left':
			case 'top':
			case 'right':
			case 'bottom': {
				const sGroup = dragging.group;
				const sItems = sGroup.nav.childNodes;
				const split = target.parentNode.split;
				const prev = target.previousSibling;
				const next = target.nextSibling;
				if (
					sItems.length > 1 ||
					(target !== sGroup &&
						((direction === 'left' && !(split === 'horizontal' && prev === sGroup)) ||
							(direction === 'top' && !(split === 'vertical' && prev === sGroup)) ||
							(direction === 'right' &&
								!(split === 'horizontal' && next === sGroup)) ||
							(direction === 'bottom' && !(split === 'vertical' && next === sGroup))))
				) {
					if (
						!dragging.location ||
						dragging.location.trigger !== this ||
						dragging.location.target !== target ||
						dragging.location.direction !== direction
					) {
						Layout.updateHint({
							trigger: this,
							target: target,
							direction: direction
						});
					}
					break;
				}
			}
			case 'center':
			default:
				if (dragging.location) {
					Layout.updateHint(null);
				}
				break;
		}
	}
};

Layout.borderPointerdown = function (event) {
	// event.preventDefault()
	switch (event.button) {
		case 0:
			if (!Layout.resizing) {
				Layout.resizing = event;
				const group = this.parentNode;
				const outer = group.parentNode;
				switch (outer.split) {
					case 'horizontal':
						event.mode = 'col-resize';
						event.startX = Math.round(outer.clientWidth * group.end);
						Cursor.open('cursor-col-resize');
						break;
					case 'vertical':
						event.mode = 'row-resize';
						event.startY = Math.round(outer.clientHeight * group.end);
						Cursor.open('cursor-row-resize');
						break;
				}
				event.outer = outer;
				event.group = group;
				event.end = group.end;
				window.on('pointerup', Layout.pointerup);
				window.on('pointermove', Layout.pointermove);
				const groups = Layout.getKeyGroups();
				const infos = (event.infos = []);
				for (const group of groups) {
					const info = document.createElement('group-info');
					(info as any).manager = (group as any).manager;
					group.appendChild(info);
					infos.push(info);
				}
				Layout.updateGroupInfo();
			}
			break;
	}
};

Layout.pointerup = function (event) {
	const { resizing } = Layout;
	if (resizing === null) {
		return;
	}
	if (event === undefined) {
		event = resizing;
	}
	if (resizing.relate(event)) {
		switch (resizing.mode) {
			case 'col-resize':
				Cursor.close('cursor-col-resize');
				break;
			case 'row-resize':
				Cursor.close('cursor-row-resize');
				break;
		}
		for (const info of resizing.infos) {
			info.remove();
		}
		Layout.resizing = null;
		window.off('pointerup', Layout.pointerup);
		window.off('pointermove', Layout.pointermove);
	}
};

Layout.pointermove = function (event) {
	let end;
	const { resizing } = Layout;
	switch (resizing.mode) {
		case 'col-resize':
			end =
				+(event.clientX + resizing.startX - resizing.clientX) / resizing.outer.clientWidth;
			break;
		case 'row-resize':
			end =
				+(event.clientY + resizing.startY - resizing.clientY) / resizing.outer.clientHeight;
			break;
	}
	end = Math.clamp(end, 0, 1);
	end = Math.roundTo(end, 6);
	if (end !== undefined) {
		const { group } = resizing;
		const lastEnd = group.end;
		if (lastEnd !== end) {
			group.end = end;
			if (end > lastEnd) {
				Layout.computeSizesAfter(group);
			} else {
				Layout.computeSizesBefore(group);
			}
			Layout.updateGroups(true);
			Layout.updateGroupInfo();
		}
	}
};
