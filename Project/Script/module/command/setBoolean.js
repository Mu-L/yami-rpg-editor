import { $, getElementReader, getElementWriter } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { VariableGetter } from '../../command/variable-accessor-window.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'
import { Variable } from '../../variable/variable.js'

Command.cases.setBoolean = new CommandSchema({
	name: 'setBoolean',
	onInitialize() {
		$('#setBoolean-confirm').on('click', () => this.save())
		$('#setBoolean-operation').loadItems([
			{ name: 'Set', value: 'set' },
			{ name: 'Not', value: 'not' },
			{ name: 'And', value: 'and' },
			{ name: 'Or', value: 'or' },
			{ name: 'Xor', value: 'xor' }
		])
		$('#setBoolean-operand-type').loadItems([
			{ name: 'Constant', value: 'constant' },
			{ name: 'Variable', value: 'variable' },
			{ name: 'List', value: 'list' },
			{ name: 'Parameter', value: 'parameter' },
			{ name: 'Script', value: 'script' }
		])
		$('#setBoolean-operand-type')
			.enableHiddenMode()
			.relate([
				{
					case: 'constant',
					targets: [$('#setBoolean-constant-value')]
				},
				{
					case: 'variable',
					targets: [$('#setBoolean-common-variable')]
				},
				{
					case: 'list',
					targets: [
						$('#setBoolean-common-variable'),
						$('#setBoolean-list-index')
					]
				},
				{
					case: 'parameter',
					targets: [$('#setBoolean-parameter-key')]
				},
				{ case: 'script', targets: [$('#setBoolean-script')] }
			])
		$('#setBoolean-constant-value').loadItems([
			{ name: 'False', value: false },
			{ name: 'True', value: true }
		])
		$('#setBoolean-operand-type').on('write', (event) => {
			let filter = 'all'
			switch (event.value) {
				case 'variable':
					filter = 'boolean'
					break
				case 'list':
					filter = 'object'
					break
			}
			$('#setBoolean-common-variable').filter = filter
		})
	},
	parseOperation(operation) {
		switch (operation) {
			case 'set':
				return ' = '
			case 'not':
				return ' =! '
			case 'and':
				return ' &= '
			case 'or':
				return ' |= '
			case 'xor':
				return ' ^= '
		}
	},
	parseOperand(operand) {
		switch (operand.type) {
			case 'constant':
				return Command.setBooleanColor(operand.value.toString())
			case 'variable':
				return Command.parseVariable(operand.variable, 'boolean')
			case 'list':
				return Command.parseListItem(operand.variable, operand.index)
			case 'parameter':
				return Command.parseParameter(operand.key)
			case 'script':
				return Command.setScriptColor(operand.script)
		}
	},
	customParse({ variable, operation, operand }) {
		const varDesc = Command.parseVariable(
			variable,
			'boolean',
			operation === 'set'
		)
		const operator = Command.setOperatorColor(
			this.parseOperation(operation)
		)
		const value = this.parseOperand(operand)
		return [
			{ color: 'variable' },
			{ text: Local.get('command.setBoolean.alias') + ' ' },
			{ color: 'restore' },
			{ text: `${varDesc}${operator}${value}` }
		]
	},
	customLoad({
		variable = { type: 'local', key: '' },
		operation = 'set',
		operand = { type: 'constant', value: false }
	}) {
		const write = getElementWriter('setBoolean')
		let constantValue = false
		let commonVariable = { type: 'local', key: '' }
		let listIndex = 0
		let parameterKey = ''
		let script = ''
		switch (operand.type) {
			case 'constant':
				constantValue = operand.value
				break
			case 'variable':
				commonVariable = operand.variable
				break
			case 'list':
				commonVariable = operand.variable
				listIndex = operand.index
				break
			case 'parameter':
				parameterKey = operand.key
				break
			case 'script':
				script = operand.script
				break
		}
		write('variable', variable)
		write('operation', operation)
		write('operand-type', operand.type)
		write('constant-value', constantValue)
		write('common-variable', commonVariable)
		write('list-index', listIndex)
		write('parameter-key', parameterKey)
		write('script', script)
		$('#setBoolean-variable').getFocus()
	},
	customSave() {
		const read = getElementReader('setBoolean')
		const variable = read('variable')
		if (VariableGetter.isNone(variable)) {
			return $('#setBoolean-variable').getFocus()
		}
		const operation = read('operation')
		const type = read('operand-type')
		let operand
		switch (type) {
			case 'constant': {
				const value = read('constant-value')
				operand = { type, value }
				break
			}
			case 'variable': {
				const variable = read('common-variable')
				if (VariableGetter.isNone(variable)) {
					return $('#setBoolean-common-variable').getFocus()
				}
				operand = { type, variable }
				break
			}
			case 'list': {
				const variable = read('common-variable')
				if (VariableGetter.isNone(variable)) {
					return $('#setBoolean-common-variable').getFocus()
				}
				const index = read('list-index')
				operand = { type, variable, index }
				break
			}
			case 'parameter': {
				const key = read('parameter-key')
				if (key === '') {
					return $('#setBoolean-parameter-key').getFocus()
				}
				operand = { type, key }
				break
			}
			case 'script': {
				const script = read('script').trim()
				if (script === '') {
					return $('#setBoolean-script').getFocus()
				}
				operand = { type, script }
				break
			}
		}
		Command.save({ variable, operation, operand })
	}
})
