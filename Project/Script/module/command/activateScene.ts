import { $, getElementReader, getElementWriter } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Scene } from '../../scene/scene-window.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.activateScene = new CommandSchema({
	name: 'activateScene',
	onInitialize() {
		$('#activateScene-confirm').on('click', () => this.save());
		$('#activateScene-pointer').loadItems([
			{ name: 'Scene A', value: 0 },
			{ name: 'Scene B', value: 1 }
		]);
	},
	parsePointer(pointer) {
		switch (pointer) {
			case 0:
				return 'A';
			case 1:
				return 'B';
		}
	},
	customParse({ pointer }) {
		return [
			{ color: 'scene' },
			{ text: Local.get('command.activateScene') + Token(': ') },
			{ text: this.parsePointer(pointer) }
		];
	},
	customLoad({ pointer = 0 }) {
		const write = getElementWriter('activateScene');
		write('pointer', pointer);
		$('#activateScene-pointer').getFocus();
	},
	customSave() {
		const read = getElementReader('activateScene');
		Command.save({ pointer: read('pointer') });
	}
});
