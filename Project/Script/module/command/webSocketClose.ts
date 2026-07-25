import { $, getElementReader } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.webSocketClose = new CommandSchema({
	name: 'webSocketClose',
	onInitialize() {
		$('#webSocketClose-id').write('');
		$('#webSocketClose-code').write('');
		$('#webSocketClose-reason').write('');
		$('#webSocketClose-confirm').on('click', () => this.save());
	},
	customParse({ id = '', code = '', reason = '' }) {
		const head = [
			{ color: 'network' },
			{ text: Local.get('command.webSocketClose') },
			{ text: ' , ' },
			{ color: 'normal' },
			{ text: id }
		];
		if (code !== '' && code !== null && code !== undefined) {
			head.push({ text: ' , ' }, { text: String(code) });
		}
		if (reason) {
			head.push({ text: ' , ' }, { text: reason });
		}
		return head;
	},
	customLoad({ id = '', code = '', reason = '' }) {
		$('#webSocketClose-id').write(id);
		$('#webSocketClose-code').write(code ?? '');
		$('#webSocketClose-reason').write(reason);
		$('#webSocketClose-id').getFocus();
	},
	customSave() {
		const elId = $('#webSocketClose-id');
		const id = elId.read();
		if (!id || VariableGetter.isNone(id)) {
			return elId.getFocus();
		}
		const read = getElementReader('webSocketClose');
		const code = read('code');
		Command.save({
			id: id,
			code: code === '' ? '' : Number(code),
			reason: read('reason')
		});
	}
});
