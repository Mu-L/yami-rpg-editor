import { $, getElementReader } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { VariableGetter } from '../../command/variable-accessor-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.webSocketSend = new CommandSchema({
	name: 'webSocketSend',
	onInitialize() {
		$('#webSocketSend-id').write('');
		$('#webSocketSend-data').write('');
		$('#webSocketSend-confirm').on('click', () => this.save());
	},
	customParse({ id = '', data = '' }) {
		return [
			{ color: 'network' },
			{ text: Local.get('command.webSocketSend') },
			{ text: ' , ' },
			{ color: 'normal' },
			{ text: id },
			{ text: ' , ' },
			{
				text:
					typeof data === 'string'
						? data.length > 20
							? data.substring(0, 20) + '...'
							: data
						: Command.parseVariable(data, 'any')
			}
		];
	},
	customLoad({ id = '', data = '' }) {
		$('#webSocketSend-id').write(id);
		$('#webSocketSend-data').write(data);
		$('#webSocketSend-id').getFocus();
	},
	customSave() {
		const elId = $('#webSocketSend-id');
		const id = elId.read();
		if (!id || VariableGetter.isNone(id)) {
			return elId.getFocus();
		}
		const elData = $('#webSocketSend-data');
		const data = elData.read();
		if (!data || VariableGetter.isNone(data)) {
			return elData.getFocus();
		}
		const read = getElementReader('webSocketSend');
		Command.save({
			id: id,
			data: data
		});
	}
});
