import { $ } from '../util/dom.ts';
import { Command } from './command-object.ts';
import { SwitchCondition } from './match-condition-window.ts';
import { Window } from '../tools/window-object.ts';

// ******************************** 匹配 - 分支窗口 ********************************

export const SwitchBranch = {
	// properties
	target: null,
	commands: null,
	// methods
	initialize: null,
	parse: null,
	open: null,
	save: null,
	// events
	windowClosed: null,
	confirm: null
};

// 初始化
SwitchBranch.initialize = function () {
	// 侦听事件
	$('#switch-branch').on('closed', this.windowClosed);
	$('#switch-branch-confirm').on('click', this.confirm);
};

// 解析项目
SwitchBranch.parse = function (branch, listData) {
	const words = Command.words;
	for (const condition of branch.conditions) {
		words.push(SwitchCondition.parse(condition));
	}
	let string = words.join();
	if (listData) {
		string = Command.removeTextTags(string);
	}
	return string;
};

// 打开数据
SwitchBranch.open = function (branch) {
	if (this.target.inserting) {
		SwitchCondition.target = this.target;
		SwitchCondition.open();
	} else {
		Window.open('switch-branch');
		$('#switch-branch-conditions').write(branch.conditions.slice());
		$('#switch-branch-conditions').getFocus();
		this.commands = branch.commands;
	}
};
// 保存数据
SwitchBranch.save = function () {
	if (this.target.inserting) {
		const condition = SwitchCondition.save();
		if (condition !== undefined) {
			const conditions = [condition];
			const commands = [];
			return { conditions, commands };
		}
	} else {
		const element = $('#switch-branch-conditions');
		const conditions = element.read();
		if (conditions.length === 0) {
			return element.getFocus();
		}
		const commands = this.commands;
		Window.close('switch-branch');
		return { conditions, commands };
	}
};

// 窗口 - 已关闭事件
SwitchBranch.windowClosed = function (event) {
	SwitchBranch.commands = null;
	$('#switch-branch-conditions').clear();
};

// 确定按钮 - 鼠标点击事件
SwitchBranch.confirm = function (event) {
	return SwitchBranch.target.save();
};
