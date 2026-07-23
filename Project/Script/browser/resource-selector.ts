import { clipboard } from 'electron';
import { $ } from '../util/dom.ts';
import { Data } from '../data/data-object.ts';
import { AudioManager } from '../audio/audio-manager.ts';
import { Menu } from '../components/menu-list.ts';
import { Directory } from '../file/directory-object.ts';
import { FileItem } from '../file/file-item.ts';
import { File } from '../file/file-system-core.ts';
import { FolderItem } from '../file/folder-item.ts';
import { Reference } from '../log/related-references.ts';
import { Local } from '../tools/localization.ts';
import { Window } from '../tools/window-object.ts';

// ******************************** 资源选择器 ********************************

import '../components/file-browser.js';
import { EventBus } from '../module/eventbus.ts';
const Selector = $('#selector-browser');
export { Selector };
// properties
Selector.target = null;
Selector.allowNone = true;
Selector.audioPlayed = false;
Selector.lastDir = 'Assets';

// 设置搜索框ID接入语言包（必须在 Local.update 之前完成，否则本地化找不到元素）
// 自定义元素在 editor_loaded 后才升级，searcher 才存在，故延迟绑定
EventBus.once('editor_loaded', () => {
	if (Selector.head && Selector.head.searcher) {
		Selector.head.searcher.id = 'selector-search';
	}
});
// methods
Selector.initialize = null;
Selector.open = null;
Selector.playAudio = null;
Selector.saveToProject = null;
Selector.loadFromProject = null;
// events
Selector.windowClosed = null;
Selector.windowResize = null;
Selector.searcherKeydown = null;
Selector.bodyKeydown = null;
Selector.bodyOpen = null;
Selector.bodyPopup = null;
Selector.confirm = null;

// 初始化
Selector.initialize = function () {
	// 因为不需要拖拽，覆盖body.activateFile事件
	this.body.activateFile = this.body.select;

	// 侦听事件
	this.body.on('keydown', this.bodyKeydown);
	this.body.on('open', this.bodyOpen);
	this.body.on('popup', this.bodyPopup);
	this.head.searcher.on('keydown', this.searcherKeydown);
	$('#selector').on('closed', this.windowClosed);
	$('#selector').on('resize', this.windowResize);
	$('#selector-confirm').on('click', this.confirm);
};

// 打开窗口
Selector.open = function (target, allowNone = true) {
	this.target = target;
	this.allowNone = allowNone;
	Window.open('selector');

	const { nav, head, body } = this;
	const guid = target.read();
	const meta = Data.manifest.guidMap[guid];
	const filter = target.filter;
	this.filters = filter ? filter.split(' ') : null;
	body.computeGridProperties();
	if (meta !== undefined) {
		const path = meta.path;
		nav.load(Directory.getFolder(path));
		body.selectByPath(path);
	} else {
		nav.load(Directory.getFolder(this.lastDir));
	}
	head.searcher.getFocus();
};

// 播放音频
Selector.playAudio = function () {
	const files = this.links.body.selections;
	if (files.length === 1 && files[0].type === 'audio') {
		this.audioPlayed = true;
		AudioManager.player.stop();
		AudioManager.player.play(files[0].path);
	}
};

// 保存状态到项目文件
Selector.saveToProject = function (project) {
	const { selector } = project;
	const { viewIndex } = this.body;
	selector.view = viewIndex ?? selector.view;
};

// 从项目文件中加载状态
Selector.loadFromProject = function (project) {
	const { view } = project.selector;
	this.directory = [Directory.assets];
	this.body.setViewIndex(view);
};

// 窗口 - 已关闭事件
Selector.windowClosed = function (event) {
	const folder = Selector.nav.selections[0] ?? Selector.backupFolders[0];
	Selector.lastDir = folder ? folder.path : 'Assets';
	Selector.target = null;
	Selector.restoreDisplay();
	Selector.nav.clear();
	Selector.head.address.clear();
	Selector.body.clear();
	// 停止播放预览中的声音
	if (Selector.audioPlayed) {
		Selector.audioPlayed = false;
		AudioManager.player.stop();
	}
};

// 窗口 - 调整大小事件
Selector.windowResize = function (event) {
	Selector.nav.resize();
	Selector.body.computeGridProperties();
	Selector.body.resize();
	Selector.body.updateContentSize();
};

// 搜索框 - 键盘按下事件
Selector.searcherKeydown = function (event) {
	if (event.cmdOrCtrlKey) {
		return;
	} else if (event.altKey) {
		return;
	} else if (event.shiftKey) {
		return;
	} else {
		switch (event.code) {
			case 'Tab':
				Selector.body.selectDefault();
				break;
			case 'Enter':
			case 'NumpadEnter':
				if (this.read()) {
					event.stopImmediatePropagation();
					const { body } = Selector;
					const { elements } = body;
					if (elements.count === 1) {
						const { file } = elements[0];
						if (file instanceof FileItem) {
							body.select(file);
							Selector.confirm(event);
						}
					}
				}
				break;
		}
	}
};

// 身体 - 键盘按下事件
Selector.bodyKeydown = function (event) {
	if (event.cmdOrCtrlKey) {
		return;
	} else {
		switch (event.code) {
			case 'Space':
				Selector.playAudio();
				break;
			default:
				return;
		}
		event.stopImmediatePropagation();
	}
};

// 身体 - 打开事件
Selector.bodyOpen = function (event) {
	return Selector.confirm(event);
};

// 身体 - 菜单弹出事件
Selector.bodyPopup = function (event) {
	const items = [];
	const { target } = event.raw;
	const { browser, nav } = this.links;
	const get = Local.createGetter('menuFileBrowser');
	if (target.seek('file-body-pane') === this) {
		const folders = nav.selections;
		if (!(browser.display === 'normal' && folders.length === 1)) {
			return;
		}
		items.push({
			label: get(Local.showInExplorer()),
			click: () => {
				File.openPath(File.path(folders[0].path));
			}
		});
	} else {
		const element = target.seek('file-body-item', 2);
		if (element.tagName === 'FILE-BODY-ITEM' && element.hasClass('selected')) {
			const { selections } = this;
			const { file } = element;
			const single = selections.length === 1;
			if (single && file.type === 'audio') {
				items.push({
					label: get('play'),
					accelerator: 'Space',
					click: () => {
						Selector.playAudio();
					}
				});
			}
			items.push({
				label: get(Local.showInExplorer()),
				click: () => {
					this.showInExplorer();
				}
			});
			if (browser.display === 'search') {
				items.push({
					label: get('openFileLocation'),
					enabled: single,
					click: () => {
						this.openFileLocation(file);
					}
				});
			}
			items.push(
				{
					label: get(file instanceof FolderItem ? 'open' : 'select'),
					accelerator: 'Enter',
					enabled: single,
					click: () => {
						this.openFile(file);
					}
				},
				{
					label: get('delete'),
					accelerator: 'Delete',
					enabled: !selections.includes(Directory.assets),
					click: () => {
						this.deleteFiles();
					}
				},
				{
					label: get('rename'),
					accelerator: 'F2',
					enabled: single && file !== Directory.assets,
					click: () => {
						this.rename(file);
					}
				},
				{
					label: get('export'),
					click: () => {
						this.exportFile();
					}
				}
			);
			if (single && file instanceof FileItem) {
				items.push(
					{
						label: get('copy-id'),
						click: () => {
							navigator.clipboard.writeText(file.meta.guid);
						}
					},
					{
						label: get('find-references'),
						accelerator: 'Alt+LB',
						click: () => {
							Reference.openRelated(file.meta.guid);
						}
					}
				);
			}
		}
	}
	if (items.length !== 0) {
		Menu.popup(
			{
				x: event.clientX,
				y: event.clientY
			},
			items
		);
	}
};

// 确定按钮 - 鼠标点击事件
Selector.confirm = function (event) {
	if (Selector.dragging) {
		return;
	}
	const files = Selector.body.selections;
	switch (files.length) {
		case 1:
			if (files[0] instanceof FileItem) {
				const file = files[0];
				const meta = file.meta;
				if (meta !== undefined) {
					Selector.target.input(meta.guid);
					Window.close('selector');
				}
			}
			break;
		case 0:
			if (Selector.allowNone) {
				Selector.target.input('');
				Window.close('selector');
			}
			break;
	}
};

import path from 'node:path';
