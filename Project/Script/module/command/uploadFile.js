'use strict'
import { $, getElementReader, getElementWriter } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { VariableGetter } from '../../command/variable-accessor-window.js'
import { RequestkeyValueBind } from './requestURL.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.uploadFile = new CommandSchema({
	name: 'uploadFile',
	onInitialize() {
		$('#uploadFile-method').loadItems([
			{ name: 'POST', value: 'POST' },
			{ name: 'PUT', value: 'PUT' }
		])
		$('#uploadFile-method').write('POST')
		$('#uploadFile-url').write('')
		$('#uploadFile-path').write('')
		$('#uploadFile-header').bind(RequestkeyValueBind)
		$('#uploadFile-field').write('file')
		$('#uploadFile-confirm').on('click', () => this.save())
	},
	customParse({
		url = '',
		method = 'POST',
		path = '',
		field = 'file',
		headers = [],
		callback = '',
		rateCallback = ''
	}) {
		const head = [
			{ color: 'network' },
			{ text: Local.get('command.uploadFile') },
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
			{ text: method },
			{ text: ' , ' },
			{ text: callback },
			{ text: ' -> ' }
		]
		const contents = []
		for (const i of headers) {
			contents.push(
				{ text: ' , ' },
				{ color: 'normal' },
				{
					text: `${typeof i.key === 'string' ? i.key : Command.parseVariable(i.key, 'any')} = ${typeof i.value === 'string' ? i.value : Command.parseVariable(i.value, 'any')}`
				}
			)
		}
		return head.concat(
			contents.slice(1),
			{ text: `, ${Local.get('command.uploadFilePath')} = ` },
			{ color: 'normal' },
			{
				text:
					typeof path === 'string'
						? path
						: Command.parseVariable(path, 'any')
			},
			{ text: ' , ' },
			{ color: 'normal' },
			{ text: field },
			{ text: ' , ' },
			{ text: rateCallback }
		)
	},
	customLoad({
		url = '',
		method = 'POST',
		path = '',
		field = 'file',
		headers = [],
		callback = '',
		rateCallback = ''
	}) {
		$('#uploadFile-method').write(method)
		$('#uploadFile-callback').write(callback)
		$('#uploadFile-rateCallback').write(rateCallback)
		$('#uploadFile-url').write(url)
		$('#uploadFile-path').write(path)
		$('#uploadFile-field').write(field)
		$('#uploadFile-url').getFocus()
		const write = getElementWriter('uploadFile')
		write('header', headers)
	},
	customSave() {
		const elVariable = $('#uploadFile-url')
		const variable = elVariable.read()
		if (!variable || VariableGetter.isNone(variable)) {
			return elVariable.getFocus()
		}
		const elPath = $('#uploadFile-path')
		const path = elPath.read()
		if (!path || VariableGetter.isNone(path)) {
			return elPath.getFocus()
		}
		const read = getElementReader('uploadFile')
		Command.save({
			url: variable,
			method: read('method'),
			path: path,
			field: read('field'),
			headers: read('header'),
			callback: read('callback'),
			rateCallback: read('rateCallback')
		})
	}
})
