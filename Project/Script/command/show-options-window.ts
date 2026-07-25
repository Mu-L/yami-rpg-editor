import { $ } from '@/util/dom.ts';
import { Command } from './command-object.ts';
import { GameLocal } from '@/local/local-object.ts';
import { Window } from '@/tools/window-object.ts';

export const Choices = {
	target: null,
	commands: null,
	initialize: null,
	parse: null,
	open: null,
	save: null,
	windowClosed: null,
	confirm: null
};

Choices.initialize = function () {
	$('#choice').on('closed', this.windowClosed);
	$('#choice-confirm').on('click', this.confirm);
};

Choices.parse = function (choice) {
	return Command.removeTextTags(Command.parseVariableTag(GameLocal.replace(choice.content)));
};

Choices.open = function (choice = { content: '', commands: [] }) {
	Window.open('choice');
	$('#choice-content').write(choice.content);
	$('#choice-content').getFocus('all');
	this.commands = choice.commands;
};

Choices.save = function () {
	const commands = this.commands;
	const content = $('#choice-content').read().trim();
	if (content === '') {
		return $('#choice-content').getFocus();
	}
	Window.close('choice');
	return { content, commands };
};

Choices.windowClosed = function (event) {
	Choices.commands = null;
};

Choices.confirm = function (event) {
	return Choices.target.save();
};
