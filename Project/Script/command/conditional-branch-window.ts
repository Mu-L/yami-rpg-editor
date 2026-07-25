import { $ } from '../util/dom.ts';
import { Command } from './command-object.ts';
import { IfCondition } from './conditional-condition-window.ts';
import { Window } from '../tools/window-object.ts';

export const IfBranch = {
	target: null,
	commands: null,
	initialize: null,
	parse: null,
	open: null,
	save: null,
	windowClosed: null,
	confirm: null
};

IfBranch.initialize = function () {
	$('#if-branch-mode').loadItems([
		{ name: 'Meet All', value: 'all' },
		{ name: 'Meet Any', value: 'any' }
	]);

	$('#if-branch').on('closed', this.windowClosed);
	$('#if-branch-confirm').on('click', this.confirm);
};

IfBranch.parse = function (branch, listData) {
	const words = Command.words;
	let joint;
	switch (branch.mode) {
		case 'all':
			joint = Command.setOperatorColor(' && ');
			break;
		case 'any':
			joint = Command.setOperatorColor(' || ');
			break;
	}
	for (const condition of branch.conditions) {
		words.push(IfCondition.parse(condition));
	}
	let string = words.join(joint);
	if (listData) {
		string = Command.removeTextTags(string);
	}
	return string;
};

IfBranch.open = function (branch) {
	if (this.target.inserting) {
		IfCondition.target = this.target;
		IfCondition.open();
	} else {
		Window.open('if-branch');
		$('#if-branch-mode').write(branch.mode);
		$('#if-branch-conditions').write(branch.conditions.slice());
		$('#if-branch-conditions').getFocus();
		this.commands = branch.commands;
	}
};

IfBranch.save = function () {
	if (this.target.inserting) {
		const condition = IfCondition.save();
		if (condition !== undefined) {
			const mode = 'all';
			const conditions = [condition];
			const commands = [];
			return { mode, conditions, commands };
		}
	} else {
		const mode = $('#if-branch-mode').read();
		const element = $('#if-branch-conditions');
		const conditions = element.read();
		if (conditions.length === 0) {
			return element.getFocus();
		}
		const commands = this.commands;
		Window.close('if-branch');
		return { mode, conditions, commands };
	}
};

IfBranch.windowClosed = function (event) {
	IfBranch.commands = null;
	$('#if-branch-conditions').clear();
};

IfBranch.confirm = function (event) {
	return IfBranch.target.save();
};
