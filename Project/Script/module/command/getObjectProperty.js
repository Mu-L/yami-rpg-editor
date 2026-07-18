import { $, getElementReader, getElementWriter } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { VariableGetter } from '../../command/variable-accessor-window.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'
import { Window } from '../../tools/window-object.js'
export const IndexBind = {
	target: null,
	type: null,
	initialize() {
		this.target = null
		this.type = 'get-object-index'
		// 侦听事件
		$('#ObjectProperty-index-confirm').on('click', this.confirm)
	},
	parse(item) {
		return `${item.text}`
	},
	open(item) {
		Window.open('ObjectProperty-index')
		$('#ObjectProperty-index-name').getFocus()
		if (item) {
			$('#ObjectProperty-index-name').write(item.text)
		} else {
			$('#ObjectProperty-index-name').write('')
		}
	},
	save() {
		const read = getElementReader('ObjectProperty-index')
		const data = { text: read('name') }
		// 清空输入框
		$('#ObjectProperty-index-name').write('')
		Window.close('ObjectProperty-index')
		return data
	},
	confirm() {
		return IndexBind.target.save()
	}
}

// 获取对象属性
Command.cases.getObjectProperty = new CommandSchema({
	name: 'getObjectProperty',
	onInitialize() {
		$('#getObjectProperty-confirm').on('click', () => this.save())
		$('#getObjectProperty-list').bind(IndexBind)
		$('#getObjectProperty').on('closed', () => {
			$('#getObjectProperty-list').clear()
		})
	},
	customParse({ variable, saveVariable, properties }) {
		const contents = []
		for (const i of properties) {
			contents.push({ text: '.' }, { color: 'normal' }, { text: i.text })
		}
		return [
			{ color: 'variable' },
			{ text: Local.get('command.getObjectProperty') + ' ' },
			{ text: Command.parseVariable(saveVariable, 'any') + '=' },
			{ text: Command.parseVariable(variable, 'any') + '.' }
		].concat(contents.slice(1))
	},
	customLoad({
		variable = { type: 'local', key: '' },
		saveVariable = { type: 'local', key: '' },
		properties = []
	}) {
		$('#getObjectProperty-save-variable').write(saveVariable)
		$('#getObjectProperty-variable').write(variable)
		$('#getObjectProperty-variable').getFocus()
		const write = getElementWriter('getObjectProperty')
		write('list', properties)
	},
	customSave() {
		const elVariable = $('#getObjectProperty-variable')
		const variable = elVariable.read()
		if (VariableGetter.isNone(variable)) {
			return elVariable.getFocus()
		}
		const elsaveVariable = $('#getObjectProperty-save-variable')
		const saveVariable = elsaveVariable.read()
		if (VariableGetter.isNone(saveVariable)) {
			return elsaveVariable.getFocus()
		}
		const read = getElementReader('getObjectProperty')
		const properties = read('list')
		if (properties.length === 0) {
			return $('#getObjectProperty-list').getFocus()
		}
		Command.save({ variable, saveVariable, properties })
	}
})

// 设置对象属性
Command.cases.setObjectProperty = new CommandSchema({
	name: 'setObjectProperty',
	onInitialize() {
		$('#setObjectProperty-confirm').on('click', () => this.save())
		$('#setObjectProperty-list').bind(IndexBind)
		$('#setObjectProperty').on('closed', () => {
			$('#setObjectProperty-list').clear()
		})
	},
	customParse({ variable, valueVariable, properties }) {
		const contents = []
		for (const i of properties) {
			contents.push({ text: '.' }, { color: 'normal' }, { text: i.text })
		}
		return [
			{ color: 'variable' },
			{ text: Local.get('command.setObjectProperty') + ' ' },
			{ text: Command.parseVariable(variable, 'any') + '.' }
		]
			.concat(contents.slice(1))
			.concat([
				{ text: '=' + Command.parseVariable(valueVariable, 'any') }
			])
	},
	customLoad({
		variable = { type: 'local', key: '' },
		valueVariable = { type: 'local', key: '' },
		properties = []
	}) {
		$('#setObjectProperty-value-variable').write(valueVariable)
		$('#setObjectProperty-variable').write(variable)
		$('#setObjectProperty-variable').getFocus()
		const write = getElementWriter('setObjectProperty')
		write('list', properties)
	},
	customSave() {
		const elVariable = $('#setObjectProperty-variable')
		const variable = elVariable.read()
		if (VariableGetter.isNone(variable)) {
			return elVariable.getFocus()
		}
		const elvalueVariable = $('#setObjectProperty-value-variable')
		const valueVariable = elvalueVariable.read()
		if (VariableGetter.isNone(valueVariable)) {
			return elvalueVariable.getFocus()
		}
		const read = getElementReader('setObjectProperty')
		const properties = read('list')
		if (properties.length === 0) {
			return $('#setObjectProperty-list').getFocus()
		}
		Command.save({ variable, valueVariable, properties })
	}
})
