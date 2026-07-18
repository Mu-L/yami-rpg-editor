'use strict'
import { $, getElementReader, getElementWriter } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { VariableGetter } from '../../command/variable-accessor-window.js'
import { RequestkeyValueBind } from './requestURL.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.downloadFile = new CommandSchema({
	name: 'downloadFile',
	onInitialize() {
		$('#downloadFile-method').loadItems([
			{ name: 'GET', value: 'GET' },
			{ name: 'POST', value: 'POST' },
			{ name: 'PUT', value: 'PUT' },
			{ name: 'DELETE', value: 'DELETE' }
		])
		$('#downloadFile-isBackground').relate([
			$('#downloadFile-isBackground-path')
		])
		$('#downloadFile-isBackground-path').disable()
		$('#downloadFile-isBackground').on('input', (e) => {
			if (e.value) $('#downloadFile-isBackground-path').enable()
			else $('#downloadFile-isBackground-path').disable()
		})
		$('#downloadFile-method').write('GET')
		$('#downloadFile-url').write('')
		$('#downloadFile-isBackground-path').write('')
		$('#downloadFile-header').bind(RequestkeyValueBind)
		$('#downloadFile-data').bind(RequestkeyValueBind)
		$('#downloadFile-confirm').on('click', () => this.save())
	},
	customParse({
		url = '',
		method = 'GET',
		headers = [],
		data = [],
		callback = '',
		rateCallback = '',
		isBackground = false,
		isBackgroundPath = ''
	}) {
		const head = [
			{ color: 'network' },
			{ text: Local.get('command.downloadFile') },
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
			{ text: ' , ' },
			{ text: rateCallback },
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
		const datas = []
		for (const i of data) {
			datas.push(
				{ text: ' , ' },
				{ color: 'normal' },
				{
					text: `${typeof i.key === 'string' ? i.key : Command.parseVariable(i.key, 'any')} = ${typeof i.value === 'string' ? i.value : Command.parseVariable(i.value, 'any')}`
				}
			)
		}
		return head.concat(
			contents.slice(1),
			{ text: `, ${Local.get('command.downloadFileData')} = ` },
			datas.slice(1),
			{ text: ' , ' },
			{ color: 'normal' },
			...(isBackground
				? [
						{
							text: isBackground
						},
						{ text: ' , ' },
						{ text: isBackgroundPath }
					]
				: [])
		)
	},
	customLoad({
		url = '',
		method = 'GET',
		headers = [],
		data = [],
		callback = '',
		rateCallback = '',
		isBackground = false,
		isBackgroundPath = ''
	}) {
		$('#downloadFile-method').write(method)
		$('#downloadFile-callback').write(callback)
		$('#downloadFile-url').write(url)
		$('#downloadFile-isBackground').write(isBackground)
		$('#downloadFile-isBackground-path').write(isBackgroundPath)
		$('#downloadFile-url').getFocus()
		const write = getElementWriter('downloadFile')
		write('header', headers)
		write('data', data)
	},
	customSave() {
		const elVariable = $('#downloadFile-url')
		const variable = elVariable.read()
		if (!variable || VariableGetter.isNone(variable)) {
			return elVariable.getFocus()
		}
		const read = getElementReader('downloadFile')
		Command.save({
			url: variable,
			method: read('method'),
			headers: read('header'),
			data: read('data'),
			callback: read('callback'),
			rateCallback: read('rateCallback'),
			isBackground: read('isBackground'),
			isBackgroundPath: read('isBackground-path')
		})
	}
})
