import { $, getElementReader, getElementWriter } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.createTrigger = new CommandSchema({
	name: 'createTrigger',
	onInitialize() {
		$('#createTrigger-confirm').on('click', () => this.save());
	},
	customParse({
		triggerId,
		caster,
		origin,
		angle,
		distance,
		scale,
		timeScale
	}) {
		const casterName = Command.parseActor(caster);
		const originName = Command.parsePosition(origin);
		const words = Command.words
			.push(Command.parseVariableFile(triggerId))
			.push(casterName)
			.push(originName.indexOf(casterName) === -1 ? originName : '')
			.push(Command.parseAngle(angle))
			.push(Command.parseVariableNumber(distance, 't'))
			.push(Command.parseVariableNumber(scale))
			.push(Command.parseVariableNumber(timeScale));
		return [
			{ color: 'skill' },
			{ text: Local.get('command.createTrigger') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({
		triggerId = '',
		caster = { type: 'trigger' },
		origin = { type: 'actor', actor: { type: 'trigger' } },
		angle = { type: 'direction', degrees: 0 },
		distance = 0,
		scale = 1,
		timeScale = 1
	}) {
		const write = getElementWriter('createTrigger');
		write('triggerId', triggerId);
		write('caster', caster);
		write('origin', origin);
		write('angle', angle);
		write('distance', distance);
		write('scale', scale);
		write('timeScale', timeScale);
		$('#createTrigger-triggerId').getFocus();
	},
	customSave() {
		const read = getElementReader('createTrigger');
		const triggerId = read('triggerId');
		if (triggerId === '') {
			return $('#createTrigger-triggerId').getFocus();
		}
		Command.save({
			triggerId,
			caster: read('caster'),
			origin: read('origin'),
			angle: read('angle'),
			distance: read('distance'),
			scale: read('scale'),
			timeScale: read('timeScale')
		});
	}
});
