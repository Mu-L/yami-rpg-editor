import { Command } from '../command/command-object.ts';
import { Data } from '../data/data-object.ts';
import { Local } from '../tools/localization.ts';
import { Window } from '../tools/window-object.ts';
import { Variable } from './variable.ts';

// 列表 - 复制
Variable.list.copy = function (item) {
	if (item && item.class !== 'folder') {
		(Clipboard as any).write('yami.data.variable', item);
	}
};

// 列表 - 粘贴
Variable.list.paste = function (dItem) {
	const copy = (Clipboard as any).read('yami.data.variable');
	if (copy) {
		// 只有冲突时进行更换ID
		// 支持跨项目复制保留ID
		if (Variable.idMap[copy.id]) {
			copy.id = Variable.createId();
			copy.name += ' - Copy';
		}
		this.addNodeTo(copy, dItem);
	}
};

// 列表 - 删除
Variable.list.delete = function (item) {
	if (item) {
		const get = Local.createGetter('confirmation');
		Window.confirm(
			{
				message: get('deleteSingleFile').replace('<filename>', item.name)
			},
			[
				{
					label: get('yes'),
					click: () => {
						const elements = this.elements;
						const index = elements.indexOf(item.element);
						this.deleteNode(item);
						Variable.closePropertyPanel();
						// 自动选择下一个列表项
						const last = elements.count - 1;
						const element = elements[Math.min(index, last)];
						if (element instanceof HTMLElement) {
							this.select(element.item);
						}
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
};

// 列表 - 保存滚动状态
Variable.list.saveScroll = function () {
	const { variables } = Data;
	// 将数据保存在外部可以切换项目后重置
	if (variables.scrollTop === undefined) {
		Object.defineProperty(variables, 'scrollTop', {
			writable: true,
			value: 0
		});
	}
	variables.scrollTop = this.scrollTop;
};

// 列表 - 恢复滚动状态
Variable.list.restoreScroll = function () {
	this.scrollTop = Data.variables.scrollTop ?? 0;
};

// 列表 - 取消搜索
Variable.list.cancelSearch = function () {
	if (this.display === 'search') {
		const active = document.activeElement;
		Variable.searcher.deleteInputContent();
		this.expandToSelection();
		this.scrollToSelection();
		active.focus();
	}
};

// 列表 - 创建文件夹
Variable.list.createFolder = function () {
	return {
		class: 'folder',
		name: 'New Folder',
		expanded: false,
		children: []
	};
};

// 列表 - 创建变量
Variable.list.createVariable = function () {
	return {
		id: Variable.createId(),
		name: 'Variable',
		value: false,
		sort: 0,
		note: ''
	};
};

// 列表 - 重写创建图标方法
Variable.list.createIcon = (function IIFE() {
	const classes = {
		boolean: 'icon-boolean',
		number: 'icon-number',
		string: 'icon-string',
		object: 'icon-object'
	};
	return function (item) {
		const icon = document.createElement('node-icon');
		if (item.class !== 'folder') {
			icon.addClass(classes[typeof item.value]);
		} else {
			icon.addClass('icon-folder');
		}
		return icon;
	};
})();

// 列表 - 更新图标
Variable.list.updateIcon = function (item) {
	const { element } = item;
	if (element?.nodeIcon) {
		const icon = this.createIcon(item);
		element.replaceChild(icon, element.nodeIcon);
		element.nodeIcon = icon;
	}
};

// 列表 - 添加元素类名
Variable.list.addElementClass = function (item) {
	item.element.addClass('variable-item');
};

// 列表 - 更新项目类名
Variable.list.updateItemClass = function (item) {
	const { element } = item;
	switch (item.sort) {
		case 0:
			element.removeClass('shared-variable');
			element.removeClass('temporary-variable');
			break;
		case 1:
			element.addClass('shared-variable');
			element.removeClass('temporary-variable');
			break;
		case 2:
			element.removeClass('shared-variable');
			element.addClass('temporary-variable');
			break;
	}
	if (item.class !== 'folder') {
		element.addClass('reference');
	} else {
		element.removeClass('reference');
	}
};

// 列表 - 创建初始化文本
Variable.list.createInitText = function (item) {
	if (item.class !== 'folder') {
		const { element } = item;
		const initText = document.createElement('text');
		initText.addClass('variable-init-text');
		element.appendChild(initText);
		element.initText = initText;
		// 对象变量的初始值是null，避免冲突
		element.initValue = undefined;
	}
};

// 列表 - 更新初始化文本
Variable.list.updateInitText = function (item) {
	const { element } = item;
	if (element.initText !== undefined) {
		let { value } = item;
		if (element.initValue !== value) {
			element.initValue = value;
			switch (typeof value) {
				case 'boolean':
				case 'number':
					element.initText.textContent = ` = ${value}`;
					break;
				case 'string':
					value = `"${Command.parseMultiLineString(value)}"`;
					element.initText.textContent = ` = ${value}`;
					break;
				case 'object':
					element.initText.textContent = '';
					break;
			}
		}
	}
};

// 列表 - 创建笔记图标
Variable.list.createNoteIcon = function (item) {
	if (item.class !== 'folder') {
		const { element } = item;
		const noteIcon = document.createElement('node-icon');
		noteIcon.addClass('icon-note');
		noteIcon.textContent = '\uf27b';
		element.appendChild(noteIcon);
		element.noteIcon = noteIcon;
		element.annotated = null;
	}
};

// 列表 - 更新笔记图标
Variable.list.updateNoteIcon = function (item) {
	const { element } = item;
	if (element.noteIcon !== undefined) {
		const annotated = item.note !== '';
		if (element.annotated !== annotated) {
			element.annotated = annotated;
			annotated ? element.noteIcon.show() : element.noteIcon.hide();
		}
	}
};

// 列表 - 在创建数据时回调
Variable.list.onCreate = function (item) {
	Variable.register(item);
};

// 列表 - 在删除数据时回调
Variable.list.onDelete = function (item) {
	Variable.unregister(item);
};

// 列表 - 在恢复数据时回调
Variable.list.onResume = function (item) {
	Variable.register(item);
};
