import { File } from '../file/file-system-core.ts';
import { Browser } from '../browser/project-browser.ts';
import { Selector } from '../browser/resource-selector.ts';
import { Command } from '../command/command-object.ts';
import { TreeList } from '../components/tree-list.ts';
import { FileItem } from '../file/file-item.ts';
import { Inspector } from '../inspector/inspector.ts';
import { PluginManager } from '../plugin/plugin.ts';

import { IScriptListInterface } from '../types/list-interface.ts';
// ******************************** 脚本列表接口 ********************************

export class ScriptListInterface implements IScriptListInterface {
	target: (HTMLElement & { [k: string]: any }) | null;
	type: string;
	filter: string;
	script: any | null;
	editor: any | null;
	owner: any | null;
	history: any | null;

	constructor(editor?: any, owner?: any) {
		this.editor = editor ?? null;
		this.owner = owner ?? null;
	}

	// 初始化
	initialize(list: any): void {
		list.togglable = true;
		this.target = null;
		this.script = null;
		this.filter = 'script';
		this.type = 'script';

		// 创建参数历史操作
		const { editor, owner } = this;
		if (editor && owner) {
			this.history = new Inspector.ParamHistory(editor, owner, list);
		}

		// 侦听事件
		list.on('pointerdown', ScriptListInterface.listPointerdown);
		list.on('dragenter', ScriptListInterface.listDragenter);
		list.on('dragleave', ScriptListInterface.listDragleave);
		list.on('dragover', ScriptListInterface.listDragover);
		list.on('drop', ScriptListInterface.listDrop);
	}

	// 解析
	parse(script: any): any {
		const box = document.createElement('box');
		box.textContent = '\uf044';
		box.addClass('script-edit-button');
		Command.invalid = false;
		const scriptName = Command.parseFileName(script.id);
		const scriptClass = Command.invalid ? 'invalid' : script.enabled ? '' : 'weak';
		return [{ content: Command.removeTextTags(scriptName), class: scriptClass }, box];
	}

	// 更新
	update(list: any) {
		// 更新事件项目的有效性
		const elements = list.elements;
		const items = list.read();
		const length = items.length;
		if (length !== 0) {
			const flags = {};
			for (let i = length - 1; i >= 0; i--) {
				const { id } = items[i];
				if (flags[id]) {
					elements[i].addClass('weak');
				} else {
					flags[id] = true;
				}
			}
		}

		// 更新宿主项目的脚本图标
		const item = this.editor?.target;
		if (item?.scripts === list.read()) {
			const element = item.element;
			const list = element?.parentNode;
			if (list instanceof TreeList) {
				(list as any).updateScriptIcon(item);
			}
		}
	}

	// 打开
	open(script = PluginManager.createData()) {
		this.script = script;
		Selector.open(this, false);
	}

	// 保存
	save() {
		return this.script;
	}

	// 模拟读取
	read() {
		return this.script.id;
	}

	// 模拟输入
	input(scriptId: any) {
		this.script.id = scriptId;
		this.target.save();
	}

	// 列表 - 指针按下事件
	static listPointerdown = (function IIFE() {
		let element = null;
		const once = { once: true };
		const pointerup = (event) => {
			if (element.contains(event.target)) {
				const el = element.parentNode;
				// 临时兼容ParamList和TreeList
				// 应该统一这个属性的命名
				const item = el.dataItem ?? el.item;
				const path = File.getPath(item.id);
				if (path) Browser.openScript(path);
			}
			element = null;
		};
		return function (event) {
			if (event.button === 0 && event.target.tagName === 'BOX') {
				element = event.target;
				// 自动过滤重复侦听器，无需额外检查
				window.on('pointerup', pointerup, once);
			}
		};
	})();

	// 列表 - 拖拽进入事件
	static listDragenter(event: any) {
		return ScriptListInterface.listDragover.call(this, event);
	}

	// 列表 - 拖拽离开事件
	static listDragleave(event: any) {
		const self: any = this;
		if (!self.contains(event.relatedTarget)) {
			self.removeClass('dragover');
		}
	}

	// 列表 - 拖拽悬停事件
	static listDragover(event: any) {
		if (Browser.dragging) {
			const file = Browser.body.activeFile;
			if (file instanceof FileItem && file.type === 'script') {
				event.dataTransfer.dropEffect = 'move';
				event.preventDefault();
				(this as any).addClass('dragover');
			}
		}
	}

	// 列表 - 拖拽释放事件
	static listDrop(event: any) {
		const file = Browser.body.activeFile;
		if (file instanceof FileItem) {
			const script = PluginManager.createData();
			script.id = file.meta.guid;
			const self: any = this;
			self.object.script = script;
			self.inserting = true;
			self.focus();
			self.select(Infinity);
			self.save();
			self.removeClass('dragover');
		}
	}
}
