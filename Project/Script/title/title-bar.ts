import { ipcRenderer } from 'electron';
import { $ } from '../util/dom.ts';
import { Path } from '../util/config.ts';
import { ctrl } from '../util/event-accessors.ts';
import { Scene } from '../scene/scene-window.ts';
import { UI } from '../ui/ui-window.ts';
import { Animation } from '../animation/animation-window.ts';
import { AudioManager } from '../audio/audio-manager.ts';
import { Menu } from '../components/menu-list.ts';
import { Data } from '../data/data-object.ts';
import { Directory } from '../file/directory-object.ts';
import { FileItem } from '../file/file-item.ts';
import { File } from '../file/file-system-core.ts';
import { Layout } from '../layout/layout.ts';
import { Editor } from '../main/editor.ts';
import { ApkBuilder } from '../module/apkbuilder.ts';
import { WebServer } from '../module/webserver.ts';
import { Particle } from '../particle/particle-window.ts';
import { Deployment } from './deploy-project-window.ts';
import { NewProject } from './new-project-window.ts';
import { Local } from '../tools/localization.ts';
import { Window } from '../tools/window-object.ts';

// 通用可空方法契约（运行时挂载的具体方法签名各异，统一用宽类型）
type TitleMethod = ((...args: any[]) => any) | null;

interface TitleShape {
	target: HTMLElement & { [k: string]: any };
	tabBar: HTMLElement & { [k: string]: any };
	theme: any | null;
	maximized: boolean;
	fullscreen: boolean;
	initialize: (() => void) | null;
	newProject: TitleMethod;
	openProject: TitleMethod;
	closeProject: TitleMethod;
	deployment: TitleMethod;
	addRecentTab: TitleMethod;
	getClosedTabMeta: TitleMethod;
	openTab: TitleMethod;
	reopenClosedTab: TitleMethod;
	askWhetherToSave: TitleMethod;
	updateTitleName: TitleMethod;
	updateBodyClass: TitleMethod;
	updateAppRegion: TitleMethod;
	switchTheme: TitleMethod;
	dispatchThemechangeEvent: TitleMethod;
	playGame: TitleMethod;
	saveToConfig: TitleMethod;
	loadFromConfig: TitleMethod;
	saveToProject: TitleMethod;
	loadFromProject: TitleMethod;
	windowBeforeClose: TitleMethod;
	windowMaximize: TitleMethod;
	windowUnmaximize: TitleMethod;
	windowEnterFullScreen: TitleMethod;
	windowLeaveFullScreen: TitleMethod;
	windowDrop: TitleMethod;
	windowDirchange: TitleMethod;
	windowLocalize: TitleMethod;
	pointerenter: TitleMethod;
	pointermove: TitleMethod;
	tabBarPointerdown: TitleMethod;
	tabBarSelect: TitleMethod;
	tabBarClosed: TitleMethod;
	tabBarPopup: TitleMethod;
	playClick: TitleMethod;
	minimizeClick: TitleMethod;
	maximizeClick: TitleMethod;
	closeClick: TitleMethod;
}

export const Title: TitleShape = {
	target: $('#title'),
	tabBar: $('#title-tabBar'),
	theme: null,
	maximized: false,
	fullscreen: false,
	initialize: null,
	newProject: null,
	openProject: null,
	closeProject: null,
	deployment: null,
	addRecentTab: null,
	getClosedTabMeta: null,
	openTab: null,
	reopenClosedTab: null,
	askWhetherToSave: null,
	updateTitleName: null,
	updateBodyClass: null,
	updateAppRegion: null,
	switchTheme: null,
	dispatchThemechangeEvent: null,
	playGame: null,
	saveToConfig: null,
	loadFromConfig: null,
	saveToProject: null,
	loadFromProject: null,
	windowBeforeClose: null,
	windowMaximize: null,
	windowUnmaximize: null,
	windowEnterFullScreen: null,
	windowLeaveFullScreen: null,
	windowDrop: null,
	windowDirchange: null,
	windowLocalize: null,
	pointerenter: null,
	pointermove: null,
	tabBarPointerdown: null,
	tabBarSelect: null,
	tabBarClosed: null,
	tabBarPopup: null,
	playClick: null,
	minimizeClick: null,
	maximizeClick: null,
	closeClick: null
};

Title.initialize = function () {
	ipcRenderer.invoke('update-max-min-icon').then((mode) => {
		switch (mode) {
			case 'maximize':
				this.windowMaximize(event);
				break;
			case 'unmaximize':
				this.windowUnmaximize(event);
				break;
			case 'enter-full-screen':
				this.windowEnterFullScreen(event);
				break;
		}
	});

	this.target.element = this.target.appendChild(document.createElement('div'));

	this.pointerenter();

	// 标签栏扩展方法 - 解析图标
	this.tabBar.parseIcon = function (type) {
		switch (type) {
			case 'scene':
				return '\uf0ac';
			case 'ui':
				return '\uf2d2';
			case 'animation':
				return '\uf110';
			case 'particle':
				return '\uf2dc';
		}
	};

	// 标签栏扩展方法 - 解析名称
	this.tabBar.parseName = function (meta) {
		return (File as any).parseMetaName(meta);
	};

	window.on('drop', this.windowDrop);
	window.on('dirchange', this.windowDirchange);
	window.on('localize', this.windowLocalize);
	$('#title').on('pointerenter', this.pointerenter);
	$('#title-tabBar').on('pointerdown', this.tabBarPointerdown);
	$('#title-tabBar').on('select', this.tabBarSelect);
	$('#title-tabBar').on('closed', this.tabBarClosed);
	$('#title-tabBar').on('popup', this.tabBarPopup);
	$('#title-play').on('click', this.playClick);
	$('#title-minimize').on('click', this.minimizeClick);
	$('#title-maximize').on('click', this.maximizeClick);
	$('#title-close').on('click', this.closeClick);

	ipcRenderer.on('before-close-window', this.windowBeforeClose);
	ipcRenderer.on('maximize', this.windowMaximize);
	ipcRenderer.on('unmaximize', this.windowUnmaximize);
	ipcRenderer.on('enter-full-screen', this.windowEnterFullScreen);
	ipcRenderer.on('leave-full-screen', this.windowLeaveFullScreen);
	NewProject.initialize();
	Deployment.initialize();
};

Title.newProject = function () {
	this.askWhetherToSave(() => {
		NewProject.open();
	});
};

Title.openProject = function () {
	this.askWhetherToSave(() => {
		const dialogs = Editor.config.dialogs;
		const location = Path.normalize(dialogs.open);
		File.showOpenDialog({
			defaultPath: location,
			filters: [
				{
					name: 'Project',
					extensions: ['yamirpg']
				}
			]
		}).then(({ filePaths }) => {
			if (filePaths.length === 1) {
				Editor.open(filePaths[0]);
			}
		});
	});
};

Title.closeProject = function () {
	this.askWhetherToSave(() => {
		Editor.close();
		WebServer.stop();
		ApkBuilder.stopBuild();
		ApkBuilder.clearLog();
		Layout.manager.switch('home');
	});
};

Title.deployment = function () {
	this.askWhetherToSave(() => {
		Deployment.open();
	});
};

Title.addRecentTab = function (guid) {
	const tabs = Editor.project.recentTabs;
	if (tabs.remove(guid)) {
		tabs.unshift(guid);
	} else {
		tabs.unshift(guid);
		while (tabs.length > 10) {
			tabs.pop();
		}
	}
};

Title.getClosedTabMeta = function () {
	const { recentTabs } = Editor.project;
	outer: for (const guid of recentTabs) {
		for (const item of this.tabBar.data) {
			if (item.meta.guid === guid) {
				continue outer;
			}
		}
		return Data.manifest.guidMap[guid];
	}
	return undefined;
};

Title.openTab = function (file) {
	const { tabBar } = this;
	const { meta, type } = file;
	let context = tabBar.find(meta);
	if (context === undefined) {
		const icon = tabBar.parseIcon(type);
		const name = tabBar.parseName(meta);
		tabBar.insert((context = { icon, name, meta, type }));
	}
	tabBar.select(context);
};

Title.reopenClosedTab = function (meta) {
	meta = meta ?? this.getClosedTabMeta();
	if (meta) {
		const file = Directory.getFile(meta.path);
		if (file instanceof FileItem) {
			this.openTab(file);
		}
	}
};

Title.askWhetherToSave = function (callback) {
	if (Data.manifest?.changes.length > 0) {
		const get = Local.createGetter('confirmation');
		Window.confirm(
			{
				message: get('closeUnsavedProject')
			},
			[
				{
					label: get('yes'),
					click: () => {
						File.save();
						callback();
					}
				},
				{
					label: get('no'),
					click: () => {
						callback();
					}
				},
				{
					label: get('cancel')
				}
			]
		);
	} else {
		callback();
	}
};

Title.updateTitleName = (function IIFE() {
	const title = $('title')[0];
	return function () {
		let text = 'Yami RPG Editor';
		if (Editor.state === 'open') {
			text = Data.config.window.title + ' - ' + text;
		}
		title.textContent = text;
	};
})();

Title.updateBodyClass = function () {
	if (this.maximized || this.fullscreen) {
		document.body.addClass('maximized');
		document.body.removeClass('border');
	} else {
		document.body.removeClass('maximized');
		document.body.addClass('border');
	}
};

// 应用拖拽区域无法自动更新 需要通过开关元素的显示来手动刷新
Title.updateAppRegion = function () {
	const { target } = this;
	target.element.show();
	// 强制刷新样式 target.element.css().display
	setTimeout(() => target.element.hide());
};

Title.switchTheme = function (scheme) {
	switch (scheme) {
		case 'light':
			if (document.documentElement.removeClass('dark')) {
				this.dispatchThemechangeEvent('light');
			}
			break;
		case 'dark':
			if (document.documentElement.addClass('dark')) {
				this.dispatchThemechangeEvent('dark');
			}
			break;
	}
};

Title.dispatchThemechangeEvent = (function IIFE() {
	const themechange = new Event('themechange');
	return function (theme) {
		this.theme = theme;
		themechange.value = theme;
		window.dispatchEvent(themechange);
	};
})();

Title.playGame = async function () {
	const element = $('#title-play');
	if (Editor.state === 'open' && !element.hasClass('selected')) {
		element.addClass('selected');

		const { activeElement } = document;
		activeElement.blur();
		activeElement.focus();

		AudioManager.player.stop();

		await File.save(false);

		ipcRenderer.send('create-player-window', File.root);

		ipcRenderer.once('player-window-closed', (event) => {
			element.removeClass('selected');
		});
	}
};

Title.saveToConfig = function (config) {
	config.theme = this.theme;
};

Title.loadFromConfig = function (config) {
	// theme 兜底：缺失或非法值时按当前 DOM 状态推断（html.dark 类 ⇒ dark，否则 light） 避免向下游派发 undefined 主题导致 webgl background[undefined] 解构炸
	let { theme } = config;
	if (theme !== 'light' && theme !== 'dark') {
		theme = document.documentElement.hasClass('dark') ? 'dark' : 'light';
	}
	switch (theme) {
		case 'light':
			document.documentElement.removeClass('dark');
			break;
		case 'dark':
			document.documentElement.addClass('dark');
			break;
	}
	this.dispatchThemechangeEvent(theme);
};

Title.saveToProject = function (project) {
	const items = this.tabBar.data;
	const length = items.length;
	const tabs = new Array(length);
	for (let i = 0; i < length; i++) {
		tabs[i] = items[i].meta.guid;
	}
	project.openTabs = tabs;

	const tab = this.tabBar.read();
	project.activeTab = tab?.meta.guid ?? '';
};

Title.loadFromProject = function (project) {
	const { openTabs, activeTab } = project;

	const dirItem = {
		icon: '\uf07c',
		name: Local.get('common.directory'),
		meta: { guid: '' },
		type: 'directory'
	};
	const items = [dirItem];
	const tabBar = this.tabBar;
	tabBar.dirItem = dirItem;
	const map = Data.manifest.guidMap;
	for (const guid of openTabs) {
		const meta = map[guid];
		if (!meta) continue;
		let type;
		switch (Path.extname(meta.path).toLowerCase()) {
			case '.scene':
				type = 'scene';
				break;
			case '.ui':
				type = 'ui';
				break;
			case '.anim':
				type = 'animation';
				break;
			case '.particle':
				type = 'particle';
				break;
			default:
				continue;
		}
		const icon = tabBar.parseIcon(type);
		const name = tabBar.parseName(meta);
		items.push({ icon, name, meta, type });
	}
	tabBar.data = items;
	tabBar.update();

	if (activeTab) {
		const elements = tabBar.childNodes;
		for (const element of elements) {
			const context = element.item;
			if (context.meta.guid === activeTab) {
				return tabBar.select(context);
			}
		}
		if (elements.length !== 0) {
			const context = elements[0].item;
			return tabBar.select(context);
		}
	}
	Layout.manager.switch('directory');
};

Title.windowBeforeClose = function (event) {
	if (Window.frames.length === 0) {
		ipcRenderer.send('prevent-close-window');
		Title.askWhetherToSave(() => {
			Editor.quit();
		});
	}
};

Title.windowMaximize = function (event) {
	this.maximized = true;
	this.updateBodyClass();
}.bind(Title);

Title.windowUnmaximize = function (event) {
	this.maximized = false;
	this.updateBodyClass();
}.bind(Title);

Title.windowEnterFullScreen = function (event) {
	this.fullscreen = true;
	this.updateBodyClass();
}.bind(Title);

Title.windowLeaveFullScreen = function (event) {
	this.fullscreen = false;
	this.updateBodyClass();
}.bind(Title);

Title.windowDrop = function (event) {
	if (Window.frames.length === 0) {
		const { files } = event.dataTransfer;
		for (const file of files) {
			if (/\.yamirpg$/i.test(file.name)) {
				this.askWhetherToSave(() => {
					Editor.open(file.path);
				});
			}
		}
	}
}.bind(Title);

Title.windowDirchange = function (event) {
	const { tabBar } = Title;
	for (const item of tabBar.data) {
		if (item === tabBar.dirItem) continue;
		const name = tabBar.parseName(item.meta);
		if (item.name !== name) {
			item.name = name;
			if (item.tab) {
				item.tab.text.textContent = tabBar.parseTabName(item);
			}
		}
	}
};

Title.windowLocalize = function (event) {
	const text = Title.tabBar.dirItem?.tab?.text;
	if (text instanceof HTMLElement) {
		text.textContent = Local.get('common.directory');
	}
};

Title.pointerenter = function (event) {
	const { target } = this;
	if (!target.active) {
		target.active = true;
		target.style.WebkitAppRegion = 'drag';
		this.updateAppRegion();
		window.on('pointermove', this.pointermove);
	}
}.bind(Title);

Title.pointermove = function (event) {
	const { target } = this;
	if (target.active) {
		let element = event.target;
		while (element) {
			if (element === target) {
				return;
			} else {
				element = element.parentNode;
			}
		}
		if (!element) {
			target.active = false;
			target.style.WebkitAppRegion = 'no-drag';
			this.updateAppRegion();
			window.off('pointermove', this.pointermove);
		}
	}
}.bind(Title);

Title.tabBarPointerdown = function (event) {
	switch (this.read()?.type) {
		case 'scene':
			Layout.readyToFocus(Scene.screen);
			break;
		case 'ui':
			Layout.readyToFocus(UI.screen);
			break;
		case 'animation':
			Layout.readyToFocus(Animation.screen);
			break;
		case 'particle':
			Layout.readyToFocus(Particle.screen);
	}
};

Title.tabBarSelect = function (event) {
	if (Layout.resizing) {
		Layout.pointerup();
	}
	const context = event.value;
	switch (context.type) {
		case 'directory':
			Layout.manager.switch('directory');
			break;
		case 'scene':
			Layout.manager.switch('scene');
			Scene.open(context);
			Scene.screen.focus();
			break;
		case 'ui':
			Layout.manager.switch('ui');
			UI.open(context);
			UI.screen.focus();
			break;
		case 'animation':
			Layout.manager.switch('animation');
			Animation.open(context);
			Animation.screen.focus();
			break;
		case 'particle':
			Layout.manager.switch('particle');
			Particle.open(context);
			Particle.screen.focus();
			break;
	}
};

Title.tabBarClosed = function (event) {
	const { closedItems, lastValue } = event;
	for (const context of closedItems) {
		switch (context.type) {
			case 'scene':
				Scene.destroy(context);
				break;
			case 'ui':
				UI.destroy(context);
				break;
			case 'animation':
				Animation.destroy(context);
				break;
			case 'particle':
				Particle.destroy(context);
				break;
		}
		if (context.meta.guid) {
			Title.addRecentTab(context.meta.guid);
		}
	}
	if (closedItems.includes(lastValue)) {
		const items = this.data;
		const index = Math.min(this.selectionIndex, items.length - 1);
		const item = items[index];
		if (item instanceof Object) {
			this.select(item);
		} else {
			Layout.manager.switch('directory');
		}
	}
};

Title.tabBarPopup = function (event) {
	const item = event.value;
	if (!item) return;
	const items = this.data;
	const last = items[items.length - 1];
	const get = Local.createGetter('menuTab');
	Menu.popup(
		{
			x: event.clientX,
			y: event.clientY
		},
		[
			{
				label: get('close'),
				accelerator: ctrl('W'),
				enabled: item.type !== 'directory',
				click: () => {
					this.close(item);
				}
			},
			{
				label: get('closeOtherTabs'),
				enabled: items.length > 1,
				click: () => {
					this.closeOtherTabs(item);
				}
			},
			{
				label: get('closeTabsToTheRight'),
				enabled: item !== last,
				click: () => {
					this.closeTabsToTheRight(item);
				}
			}
		]
	);
};

Title.playClick = function (event) {
	Title.playGame();
};

Title.minimizeClick = function (event) {
	ipcRenderer.send('minimize-window');
};

Title.maximizeClick = function (event) {
	ipcRenderer.send('maximize-window');
};

Title.closeClick = function (event) {
	Title.windowBeforeClose();
};
