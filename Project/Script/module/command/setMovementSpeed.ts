import { $, getElementReader, getElementWriter } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.setMovementSpeed = new CommandSchema({
	name: 'setMovementSpeed',
	onInitialize() {
		$('#setMovementSpeed-confirm').on('click', () => this.save());
		$('#setMovementSpeed-property').loadItems([
			{ name: 'Base Speed', value: 'base' },
			{ name: 'Speed Factor', value: 'factor' },
			{ name: 'Speed Factor (Temp)', value: 'factor-temp' }
		]);
		$('#setMovementSpeed-property')
			.enableHiddenMode()
			.relate([
				{ case: 'base', targets: [$('#setMovementSpeed-base')] },
				{
					case: ['factor', 'factor-temp'],
					targets: [$('#setMovementSpeed-factor')]
				}
			]);
	},
	customParse({ actor, property, base, factor }) {
		const label = Local.get('command.setMovementSpeed.' + property);
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(label.replace('(', Token('(')).replace(')', Token(')')));
		switch (property) {
			case 'base':
				words.push(Command.parseVariableNumber(base, 't/s'));
				break;
			case 'factor':
			case 'factor-temp':
				words.push(Command.parseVariableNumber(factor));
				break;
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setMovementSpeed') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({
		actor = { type: 'trigger' },
		property = 'base',
		base = 0,
		factor = 0
	}) {
		const write = getElementWriter('setMovementSpeed');
		write('actor', actor);
		write('property', property);
		write('base', base);
		write('factor', factor);
		$('#setMovementSpeed-actor').getFocus();
	},
	customSave() {
		const read = getElementReader('setMovementSpeed');
		const actor = read('actor');
		const property = read('property');
		switch (property) {
			case 'base': {
				Command.save({ actor, property, base: read('base') });
				break;
			}
			case 'factor':
			case 'factor-temp': {
				Command.save({ actor, property, factor: read('factor') });
				break;
			}
		}
	}
});
