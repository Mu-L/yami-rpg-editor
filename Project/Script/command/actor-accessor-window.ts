import { $, getElementReader } from '@/util/dom.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { PresetObject } from '@/tools/scene-preset-window.ts';
import { Window } from '@/tools/window-object.ts';

export const ActorGetter = {
	target: null,
	initialize: null,
	open: null,
	checkDataForPlugin: null,
	createDefaultForPlugin: null,
	confirm: null
};

ActorGetter.initialize = function () {
	$('#actorGetter-type').loadItems([
		{ name: 'Event Trigger Actor', value: 'trigger' },
		{ name: 'Skill Caster', value: 'caster' },
		{ name: 'Latest Actor', value: 'latest' },
		{ name: 'Target Actor', value: 'target' },
		{ name: 'Player Actor', value: 'player' },
		{ name: 'Party Member', value: 'member' },
		{ name: 'Global Actor', value: 'global' },
		{ name: 'By Actor ID', value: 'by-id' },
		{ name: 'Variable', value: 'variable' }
	]);

	$('#actorGetter-type')
		.enableHiddenMode()
		.relate([
			{ case: 'member', targets: [$('#actorGetter-memberId')] },
			{ case: 'global', targets: [$('#actorGetter-actorId')] },
			{ case: 'by-id', targets: [$('#actorGetter-presetId')] },
			{ case: 'variable', targets: [$('#actorGetter-variable')] }
		]);

	$('#actorGetter-confirm').on('click', this.confirm);
};

ActorGetter.open = function (target) {
	this.target = target;
	Window.open('actorGetter');

	let memberId = 0;
	let actorId = '';
	let presetId = PresetObject.getDefaultPresetId('actor');
	let variable = { type: 'local', key: '' };
	const actor = target.dataValue;
	switch (actor.type) {
		case 'trigger':
		case 'caster':
		case 'latest':
		case 'target':
		case 'player':
			break;
		case 'member':
			memberId = actor.memberId;
			break;
		case 'global':
			actorId = actor.actorId;
			break;
		case 'by-id':
			presetId = actor.presetId;
			break;
		case 'variable':
			variable = actor.variable;
			break;
	}
	$('#actorGetter-type').write(actor.type);
	$('#actorGetter-memberId').write(memberId);
	$('#actorGetter-actorId').write(actorId);
	$('#actorGetter-presetId').write(presetId);
	$('#actorGetter-variable').write(variable);
	$('#actorGetter-type').getFocus();
};

ActorGetter.checkDataForPlugin = function (data) {
	if (data instanceof Object) {
		return data.getter === 'actor';
	}
	return false;
};

ActorGetter.createDefaultForPlugin = function () {
	return { getter: 'actor', type: 'trigger' };
};

ActorGetter.confirm = function () {
	const read = getElementReader('actorGetter');
	const type = read('type');
	let getter;
	switch (type) {
		case 'trigger':
		case 'caster':
		case 'latest':
		case 'target':
		case 'player':
			getter = { type };
			break;
		case 'member': {
			const memberId = read('memberId');
			getter = { type, memberId };
			break;
		}
		case 'global': {
			const actorId = read('actorId');
			if (actorId === '') {
				return $('#actorGetter-actorId').getFocus();
			}
			getter = { type, actorId };
			break;
		}
		case 'by-id': {
			const presetId = read('presetId');
			if (presetId === '') {
				return $('#actorGetter-presetId').getFocus();
			}
			getter = { type, presetId };
			break;
		}
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone(variable)) {
				return $('#actorGetter-variable').getFocus();
			}
			getter = { type, variable };
			break;
		}
	}
	if (this.target.isPluginInput) {
		getter = { getter: 'actor', ...getter };
	}
	this.target.input(getter);
	Window.close('actorGetter');
}.bind(ActorGetter);
