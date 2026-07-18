'use strict'
import { $, getElementReader, getElementWriter } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { VariableGetter } from '../../command/variable-accessor-window.js'
import { RequestkeyValueBind } from './requestURL.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.httpRequest = new CommandSchema({
	name: 'httpRequest',
	onInitialize() {
		$('#httpRequest-method').loadItems([
			{ name: 'GET', value: 'GET' },
			{ name: 'POST', value: 'POST' },
			{ name: 'PUT', value: 'PUT' },
			{ name: 'DELETE', value: 'DELETE' },
			{ name: 'PATCH', value: 'PATCH' }
		])
		$('#httpRequest-responseType').loadItems([
			{ name: 'JSON', value: 'json' },
			{ name: 'Text', value: 'text' },
			{ name: 'Blob', value: 'blob' },
			{ name: 'ArrayBuffer', value: 'arraybuffer' },
			{ name: 'Document', value: 'document' },
			{ name: 'Stream', value: 'stream' }
		])
		$('#httpRequest-method').write('GET')
		$('#httpRequest-url').write('')
		$('#httpRequest-header').bind(RequestkeyValueBind)
		$('#httpRequest-data').bind(RequestkeyValueBind)
		$('#httpRequest-timeout').write('')
		$('#httpRequest-responseType').write('json')
		$('#httpRequest-withCredentials').write(false)
		$('#httpRequest-authUser').write('')
		$('#httpRequest-authPass').write('')
		$('#httpRequest-confirm').on('click', () => this.save())
	},
	customParse({
		url = '',
		method = 'GET',
		headers = [],
		data = [],
		callback = '',
		timeout = '',
		responseType = 'json',
		withCredentials = false,
		authUser = '',
		authPass = ''
	}) {
		const head = [
			{ color: 'network' },
			{ text: Local.get('command.httpRequest') },
			{ text: ' , ' },
			{ color: 'normal' },
			{
				text:
					typeof url === 'string'
						? url
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
		const extra = []
		if (timeout !== '' && timeout !== null && timeout !== undefined) {
			extra.push(
				{ text: ' , ' },
				{ color: 'normal' },
				{
					text: `${Local.get('command.httpRequestTimeout')} = ${timeout}`
				}
			)
		}
		extra.push(
			{ text: ' , ' },
			{ color: 'normal' },
			{
				text: `${Local.get('command.httpRequestResponseType')} = ${responseType}`
			}
		)
		if (withCredentials) {
			extra.push(
				{ text: ' , ' },
				{ color: 'normal' },
				{ text: Local.get('command.httpRequestWithCredentials') }
			)
		}
		if (authUser || authPass) {
			extra.push(
				{ text: ' , ' },
				{ color: 'normal' },
				{
					text: `${Local.get('command.httpRequestAuth')} = ${authUser}`
				}
			)
		}
		return head.concat(
			contents.slice(1),
			{ text: `, ${Local.get('command.httpRequestData')} = ` },
			datas.slice(1),
			...extra
		)
	},
	customLoad({
		url = '',
		method = 'GET',
		headers = [],
		data = [],
		callback = '',
		timeout = '',
		responseType = 'json',
		withCredentials = false,
		authUser = '',
		authPass = ''
	}) {
		$('#httpRequest-method').write(method)
		$('#httpRequest-callback').write(callback)
		$('#httpRequest-url').write(url)
		$('#httpRequest-timeout').write(timeout ?? '')
		$('#httpRequest-responseType').write(responseType)
		$('#httpRequest-withCredentials').write(withCredentials)
		$('#httpRequest-authUser').write(authUser)
		$('#httpRequest-authPass').write(authPass)
		$('#httpRequest-url').getFocus()
		const write = getElementWriter('httpRequest')
		write('header', headers)
		write('data', data)
	},
	customSave() {
		const elVariable = $('#httpRequest-url')
		const variable = elVariable.read()
		if (!variable || VariableGetter.isNone(variable)) {
			return elVariable.getFocus()
		}
		const read = getElementReader('httpRequest')
		const timeout = read('timeout')
		Command.save({
			url: variable,
			method: read('method'),
			headers: read('header'),
			data: read('data'),
			callback: read('callback'),
			timeout: timeout === '' ? '' : Number(timeout),
			responseType: read('responseType'),
			withCredentials: read('withCredentials'),
			authUser: read('authUser'),
			authPass: read('authPass')
		})
	}
})
