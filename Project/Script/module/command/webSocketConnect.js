import { $, getElementReader } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { VariableGetter } from '../../command/variable-accessor-window.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.webSocketConnect = new CommandSchema({
	name: 'webSocketConnect',
	onInitialize() {
		$('#webSocketConnect-url').write('')
		$('#webSocketConnect-id').write('')
		$('#webSocketConnect-protocols').write('')
		$('#webSocketConnect-confirm').on('click', () => this.save())
	},
	customParse({
		url = '',
		id = '',
		protocols = '',
		onOpen = '',
		onMessage = '',
		onError = '',
		onClose = ''
	}) {
		return [
			{ color: 'network' },
			{ text: Local.get('command.webSocketConnect') },
			{ text: ' , ' },
			{ color: 'normal' },
			{
				text:
					typeof url === 'string'
						? url.length > 20
							? url.substring(0, 20) + '...'
							: url
						: Command.parseVariable(url, 'any')
			},
			{ text: ' , ' },
			{ text: id }
		]
	},
	customLoad({
		url = '',
		id = '',
		protocols = '',
		onOpen = '',
		onMessage = '',
		onError = '',
		onClose = ''
	}) {
		$('#webSocketConnect-url').write(url)
		$('#webSocketConnect-id').write(id)
		$('#webSocketConnect-protocols').write(protocols)
		$('#webSocketConnect-onOpen').write(onOpen)
		$('#webSocketConnect-onMessage').write(onMessage)
		$('#webSocketConnect-onError').write(onError)
		$('#webSocketConnect-onClose').write(onClose)
		$('#webSocketConnect-url').getFocus()
	},
	customSave() {
		const elUrl = $('#webSocketConnect-url')
		const url = elUrl.read()
		if (!url || VariableGetter.isNone(url)) {
			return elUrl.getFocus()
		}
		const elId = $('#webSocketConnect-id')
		const id = elId.read()
		if (!id || VariableGetter.isNone(id)) {
			return elId.getFocus()
		}
		const read = getElementReader('webSocketConnect')
		Command.save({
			url: url,
			id: id,
			protocols: read('protocols'),
			onOpen: read('onOpen'),
			onMessage: read('onMessage'),
			onError: read('onError'),
			onClose: read('onClose')
		})
	}
})
