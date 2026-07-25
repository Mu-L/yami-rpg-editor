import { $, getElementReader } from '../util/dom.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { Enum } from '../enum/enum-window.ts';
import { Window } from '../tools/window-object.ts';

export const SkillGetter = {
	target: null,
	initialize: null,
	open: null,
	checkDataForPlugin: null,
	createDefaultForPlugin: null,
	confirm: null
};

SkillGetter.initialize = function () {
	$('#skillGetter-type').loadItems([
		{ name: 'Event Trigger Skill', value: 'trigger' },
		{ name: 'Latest Skill', value: 'latest' },
		{ name: 'By Shortcut Key', value: 'by-key' },
		{ name: 'By Skill ID', value: 'by-id' },
		{ name: 'Variable', value: 'variable' }
	]);

	$('#skillGetter-type')
		.enableHiddenMode()
		.relate([
			{
				case: 'by-key',
				targets: [$('#skillGetter-actor'), $('#skillGetter-key')]
			},
			{
				case: 'by-id',
				targets: [$('#skillGetter-actor'), $('#skillGetter-skillId')]
			},
			{ case: 'variable', targets: [$('#skillGetter-variable')] }
		]);

	$('#skillGetter-confirm').on('click', this.confirm);
};

SkillGetter.open = function (target) {
	this.target = target;
	Window.open('skillGetter');

	$('#skillGetter-key').loadItems(Enum.getStringItems('shortcut-key'));

	let actor = { type: 'trigger' };
	let key = Enum.getDefStringId('shortcut-key');
	let skillId = '';
	let variable = { type: 'local', key: '' };
	const skill = target.dataValue;
	switch (skill.type) {
		case 'trigger':
		case 'latest':
			break;
		case 'by-key':
			actor = skill.actor;
			key = skill.key;
			break;
		case 'by-id':
			actor = skill.actor;
			skillId = skill.skillId;
			break;
		case 'variable':
			variable = skill.variable;
			break;
	}
	$('#skillGetter-type').write(skill.type);
	$('#skillGetter-actor').write(actor);
	$('#skillGetter-key').write(key);
	$('#skillGetter-skillId').write(skillId);
	$('#skillGetter-variable').write(variable);
	$('#skillGetter-type').getFocus();
};

SkillGetter.checkDataForPlugin = function (data) {
	if (data instanceof Object) {
		return data.getter === 'skill';
	}
	return false;
};

SkillGetter.createDefaultForPlugin = function () {
	return { getter: 'skill', type: 'trigger' };
};

SkillGetter.confirm = function (event) {
	const read = getElementReader('skillGetter');
	const type = read('type');
	let getter;
	switch (type) {
		case 'trigger':
		case 'latest':
			getter = { type };
			break;
		case 'by-key': {
			const actor = read('actor');
			const key = read('key');
			if (key === '') {
				return $('#skillGetter-key').getFocus();
			}
			getter = { type, actor, key };
			break;
		}
		case 'by-id': {
			const actor = read('actor');
			const skillId = read('skillId');
			if (skillId === '') {
				return $('#skillGetter-skillId').getFocus();
			}
			getter = { type, actor, skillId };
			break;
		}
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone(variable)) {
				return $('#skillGetter-variable').getFocus();
			}
			getter = { type, variable };
			break;
		}
	}
	if (this.target.isPluginInput) {
		getter = { getter: 'skill', ...getter };
	}
	this.target.input(getter);
	Window.close('skillGetter');
}.bind(SkillGetter);
