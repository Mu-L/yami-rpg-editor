import { $, getElementReader, getElementWriter } from '../../util/dom.js'
import { Attribute } from '../../attribute/attribute-window.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { Choices } from '../../command/show-options-window.js'
import { VariableGetter } from '../../command/variable-accessor-window.js'
import { Team } from '../../data/team-window.js'
import { File } from '../../file/file-system-core.js'
import { CommandSchema } from './schema.js'
import { Scene } from '../../scene/scene-window.js'
import { Local } from '../../tools/localization.js'
import { Variable } from '../../variable/variable.js'

Command.cases.setString = new CommandSchema({
	name: 'setString',
	onInitialize() {
		$('#setString-confirm').on('click', () => this.save())
		$('#setString-operation').loadItems([
			{ name: 'Set', value: 'set' },
			{ name: 'Add', value: 'add' }
		])
		$('#setString-operand-type').loadItems([
			{ name: 'Constant', value: 'constant' },
			{ name: 'Variable', value: 'variable' },
			{ name: 'Template String', value: 'template' },
			{ name: 'String Method', value: 'string' },
			{ name: 'Attribute Key', value: 'attribute' },
			{ name: 'Enumeration', value: 'enum' },
			{ name: 'Object', value: 'object' },
			{ name: 'Element', value: 'element' },
			{ name: 'List', value: 'list' },
			{ name: 'Parameter', value: 'parameter' },
			{ name: 'Script', value: 'script' },
			{ name: 'Other', value: 'other' }
		])
		$('#setString-operand-type')
			.enableHiddenMode()
			.relate([
				{
					case: 'constant',
					targets: [$('#setString-operand-common-value')]
				},
				{
					case: 'variable',
					targets: [$('#setString-operand-common-variable')]
				},
				{
					case: 'template',
					targets: [$('#setString-operand-common-value')]
				},
				{
					case: 'string',
					targets: [
						$('#setString-operand-string-method'),
						$('#setString-operand-common-variable')
					]
				},
				{
					case: 'attribute',
					targets: [$('#setString-operand-attribute-attributeId')]
				},
				{
					case: 'enum',
					targets: [$('#setString-operand-enum-stringId')]
				},
				{
					case: 'object',
					targets: [$('#setString-operand-object-property')]
				},
				{
					case: 'element',
					targets: [
						$('#setString-operand-element-property'),
						$('#setString-operand-element-element')
					]
				},
				{
					case: 'list',
					targets: [
						$('#setString-operand-common-variable'),
						$('#setString-operand-list-index')
					]
				},
				{
					case: 'parameter',
					targets: [$('#setString-operand-parameter-key')]
				},
				{ case: 'script', targets: [$('#setString-operand-script')] },
				{ case: 'other', targets: [$('#setString-operand-other-data')] }
			])
		$('#setString-operand-type').on('write', (event) => {
			let filter = 'all'
			switch (event.value) {
				case 'variable':
					filter = 'all'
					break
				case 'string':
					filter = 'string'
					break
				case 'object':
				case 'list':
					filter = 'object'
					break
			}
			$('#setString-operand-common-variable').filter = filter
		})
		$('#setString-operand-string-method').loadItems([
			{ name: 'Char', value: 'char' },
			{ name: 'Slice', value: 'slice' },
			{ name: 'Pad Start', value: 'pad-start' },
			{ name: 'Replace', value: 'replace' },
			{ name: 'Replace All', value: 'replace-all' }
		])
		$('#setString-operand-string-method')
			.enableHiddenMode()
			.relate([
				{
					case: 'char',
					targets: [$('#setString-operand-string-char-index')]
				},
				{
					case: 'slice',
					targets: [
						$('#setString-operand-string-slice-begin'),
						$('#setString-operand-string-slice-end')
					]
				},
				{
					case: 'pad-start',
					targets: [
						$('#setString-operand-string-pad-start-length'),
						$('#setString-operand-string-pad-start-pad')
					]
				},
				{
					case: ['replace', 'replace-all'],
					targets: [
						$('#setString-operand-string-replace-pattern'),
						$('#setString-operand-string-replace-replacement')
					]
				}
			])
		$('#setString-operand-object-property').loadItems([
			{ name: 'Actor - Team ID', value: 'actor-team-id' },
			{ name: 'Actor - File ID', value: 'actor-file-id' },
			{
				name: 'Actor - Anim Motion Name',
				value: 'actor-animation-motion-name'
			},
			{ name: 'Skill - File ID', value: 'skill-file-id' },
			{ name: 'Trigger - File ID', value: 'trigger-file-id' },
			{ name: 'State - File ID', value: 'state-file-id' },
			{ name: 'Equipment - File ID', value: 'equipment-file-id' },
			{ name: 'Equipment - Slot', value: 'equipment-slot' },
			{ name: 'Item - File ID', value: 'item-file-id' },
			{ name: 'File - ID', value: 'file-id' }
		])
		$('#setString-operand-object-property')
			.enableHiddenMode()
			.relate([
				{
					case: [
						'actor-team-id',
						'actor-file-id',
						'actor-animation-motion-name'
					],
					targets: [$('#setString-operand-common-actor')]
				},
				{
					case: 'skill-file-id',
					targets: [$('#setString-operand-common-skill')]
				},
				{
					case: 'trigger-file-id',
					targets: [$('#setString-operand-common-trigger')]
				},
				{
					case: 'state-file-id',
					targets: [$('#setString-operand-common-state')]
				},
				{
					case: ['equipment-file-id', 'equipment-slot'],
					targets: [$('#setString-operand-common-equipment')]
				},
				{
					case: 'item-file-id',
					targets: [$('#setString-operand-common-item')]
				},
				{
					case: 'file-id',
					targets: [$('#setString-operand-object-fileId')]
				}
			])
		$('#setString-operand-element-property').loadItems([
			{ name: 'Text - Content', value: 'text-content' },
			{ name: 'Text Box - Text', value: 'textBox-text' },
			{ name: 'Dialog Box - Content', value: 'dialogBox-content' }
		])
		$('#setString-operand-other-data').loadItems([
			{ name: 'Event Trigger Key', value: 'trigger-key' },
			{
				name: 'Start Position - Scene ID',
				value: 'start-position-scene-id'
			},
			{ name: 'Show Text - Content', value: 'showText-content' },
			{ name: 'Show Choices - Content', value: 'showChoices-content' },
			{ name: 'Parse Timestamp', value: 'parse-timestamp' },
			{ name: 'Screenshot(Base64)', value: 'screenshot' },
			{ name: 'Game Language', value: 'game-language' }
		])
		$('#setString-operand-other-data')
			.enableHiddenMode()
			.relate([
				{
					case: 'showChoices-content',
					targets: [
						$('#setString-operand-showChoices-content-choiceIndex')
					]
				},
				{
					case: 'parse-timestamp',
					targets: [
						$('#setString-operand-parse-timestamp-variable'),
						$('#setString-operand-parse-timestamp-format')
					]
				},
				{
					case: 'screenshot',
					targets: [
						$('#setString-operand-screenshot-width'),
						$('#setString-operand-screenshot-height')
					]
				}
			])
	},
	parseOperation(operation) {
		switch (operation) {
			case 'set':
				return ' = '
			case 'add':
				return ' += '
		}
	},
	parseStringMethod(operand) {
		const method = operand.method
		const variable = operand.variable
		const methodName = Local.get('command.setString.string.' + method)
		const varName = Command.parseVariable(variable, 'string')
		switch (method) {
			case 'char': {
				const index = Command.parseVariableNumber(operand.index)
				return (
					methodName +
					Token('(') +
					varName +
					Token(', ') +
					index +
					Token(')')
				)
			}
			case 'slice': {
				const begin = Command.parseVariableNumber(operand.begin)
				const end = Command.parseVariableNumber(operand.end)
				return (
					methodName +
					Token('(') +
					varName +
					Token(', ') +
					begin +
					Token(', ') +
					end +
					Token(')')
				)
			}
			case 'pad-start': {
				const length = Command.setNumberColor(operand.length)
				const pad = Command.setStringColor(operand.pad)
				return (
					methodName +
					Token('(') +
					varName +
					Token(', ') +
					length +
					Token(', ') +
					pad +
					Token(')')
				)
			}
			case 'replace':
			case 'replace-all': {
				const pattern = Command.parseVariableString(operand.pattern)
				const replacement = Command.parseVariableString(
					operand.replacement
				)
				return (
					methodName +
					Token('(') +
					varName +
					Token(', ') +
					pattern +
					Token(', ') +
					replacement +
					Token(')')
				)
			}
		}
	},
	parseObjectProperty(operand) {
		const property = Local.get(
			'command.setString.object.' + operand.property
		)
		switch (operand.property) {
			case 'actor-team-id':
			case 'actor-file-id':
			case 'actor-animation-motion-name':
				return (
					Command.parseActor(operand.actor) +
					Token(' -> ') +
					property.replace('.', Token('.'))
				)
			case 'skill-file-id':
				return (
					Command.parseSkill(operand.skill) + Token(' -> ') + property
				)
			case 'trigger-file-id':
				return (
					Command.parseTrigger(operand.trigger) +
					Token(' -> ') +
					property
				)
			case 'state-file-id':
				return (
					Command.parseState(operand.state) + Token(' -> ') + property
				)
			case 'equipment-file-id':
			case 'equipment-slot':
				return (
					Command.parseEquipment(operand.equipment) +
					Token(' -> ') +
					property
				)
			case 'item-file-id':
				return (
					Command.parseItem(operand.item) + Token(' -> ') + property
				)
			case 'file-id':
				return (
					Command.parseFileName(operand.fileId) +
					Token(' -> ') +
					property
				)
		}
	},
	parseElementProperty(operand) {
		const element = Command.parseElement(operand.element)
		const property = Local.get(
			'command.setString.element.' + operand.property
		)
		return element + Token(' -> ') + property.replace('.', Token('.'))
	},
	parseOther(operand) {
		const label = Local.get(
			'command.setString.other.' + operand.data
		).replace('.', Token('.'))
		switch (operand.data) {
			case 'trigger-key':
			case 'start-position-scene-id':
			case 'showText-content':
			case 'game-language':
				return label
			case 'showChoices-content-0':
			case 'showChoices-content-1':
			case 'showChoices-content-2':
			case 'showChoices-content-3': {
				const label = Local.get(
					'command.setString.other.showChoices-content'
				)
				return (
					label +
					Token('[') +
					Command.setNumberColor(operand.data.slice(-1)) +
					Token(']')
				)
			}
			case 'showChoices-content':
				return (
					label +
					Token('[') +
					Command.parseVariableNumber(operand.choiceIndex) +
					Token(']')
				)
			case 'parse-timestamp': {
				const variable = Command.parseVariable(
					operand.variable,
					'number'
				)
				const format = Command.parseVariableString(operand.format)
				return (
					label +
					Token('(') +
					variable +
					Token(', ') +
					format +
					Token(')')
				)
			}
			case 'screenshot': {
				const width = Command.setNumberColor(operand.width)
				const height = Command.setNumberColor(operand.height)
				return (
					label +
					Token('(') +
					width +
					Token(', ') +
					height +
					Token(')')
				)
			}
		}
	},
	parseOperand(operand) {
		switch (operand.type) {
			case 'constant':
				return Command.setStringColor(
					`"${Command.parseMultiLineString(operand.value)}"`
				)
			case 'template':
				return Command.parseVariableTemplate(operand.value)
			case 'variable':
				return Command.parseVariable(operand.variable, 'string')
			case 'string':
				return this.parseStringMethod(operand)
			case 'attribute':
				return Command.parseAttributeTag(operand.attributeId, 'string')
			case 'enum':
				return Command.parseEnumStringTag(operand.stringId)
			case 'object':
				return this.parseObjectProperty(operand)
			case 'element':
				return this.parseElementProperty(operand)
			case 'list':
				return Command.parseListItem(operand.variable, operand.index)
			case 'parameter':
				return Command.parseParameter(operand.key)
			case 'script':
				return operand.script
			case 'other':
				return this.parseOther(operand)
		}
	},
	customParse({ variable, operation, operand }) {
		const varDesc = Command.parseVariable(
			variable,
			'string',
			operation === 'set'
		)
		const operator = Command.setOperatorColor(
			this.parseOperation(operation)
		)
		const expression = this.parseOperand(operand)
		return [
			{ color: 'variable' },
			{ text: Local.get('command.setString.alias') + ' ' },
			{ color: 'restore' },
			{ text: `${varDesc}${operator}${expression}` }
		]
	},
	customLoad({
		variable = { type: 'local', key: '' },
		operation = 'set',
		operand = { type: 'constant', value: '' }
	}) {
		let commonValue = ''
		let stringMethod = 'char'
		let commonVariable = { type: 'local', key: '' }
		let stringCharIndex = 0
		let stringSliceBegin = 0
		let stringSliceEnd = 0
		let stringPadStartLength = 2
		let stringPadStartPad = '0'
		let stringReplacePattern = ''
		let stringReplaceReplacement = ''
		let attributeId = ''
		let enumStringId = ''
		let objectProperty = 'actor-team-id'
		let elementProperty = 'text-content'
		let elementElement = { type: 'trigger' }
		let commonActor = { type: 'trigger' }
		let commonSkill = { type: 'trigger' }
		let commonTrigger = { type: 'trigger' }
		let commonState = { type: 'trigger' }
		let commonEquipment = { type: 'trigger' }
		let commonItem = { type: 'trigger' }
		let objectFileId = ''
		let listIndex = 0
		let parameterKey = ''
		let script = ''
		let otherData = 'trigger-key'
		let showChoicesIndex = 0
		let parseTimestampVariable = { type: 'local', key: '' }
		let parseTimestampFormat = '{Y}-{M}-{D} {h}:{m}:{s}'
		let screenshotWidth = 320
		let screenshotHeight = 180
		switch (operand.type) {
			case 'constant':
			case 'template':
				commonValue = operand.value
				break
			case 'variable':
				commonVariable = operand.variable
				break
			case 'string':
				stringMethod = operand.method
				commonVariable = operand.variable
				stringCharIndex = operand.index ?? stringCharIndex
				stringSliceBegin = operand.begin ?? stringSliceBegin
				stringSliceEnd = operand.end ?? stringSliceEnd
				stringPadStartLength = operand.length ?? stringPadStartLength
				stringPadStartPad = operand.pad ?? stringPadStartPad
				stringReplacePattern = operand.pattern ?? stringReplacePattern
				stringReplaceReplacement =
					operand.replacement ?? stringReplaceReplacement
				break
			case 'attribute':
				attributeId = operand.attributeId
				break
			case 'enum':
				enumStringId = operand.stringId
				break
			case 'object':
				objectProperty = operand.property
				commonActor = operand.actor ?? commonActor
				commonSkill = operand.skill ?? commonSkill
				commonTrigger = operand.trigger ?? commonTrigger
				commonState = operand.state ?? commonState
				commonEquipment = operand.equipment ?? commonEquipment
				commonItem = operand.item ?? commonItem
				objectFileId = operand.fileId ?? objectFileId
				break
			case 'element':
				elementProperty = operand.property
				elementElement = operand.element
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
			case 'other':
				switch (operand.data) {
					case 'showChoices-content-0':
					case 'showChoices-content-1':
					case 'showChoices-content-2':
					case 'showChoices-content-3':
						operand.choiceIndex = parseInt(operand.data.slice(-1))
						operand.data = 'showChoices-content'
						break
				}
				otherData = operand.data
				showChoicesIndex = operand.choiceIndex ?? showChoicesIndex
				parseTimestampVariable =
					operand.variable ?? parseTimestampVariable
				parseTimestampFormat = operand.format ?? parseTimestampFormat
				screenshotWidth = operand.width ?? screenshotWidth
				screenshotHeight = operand.height ?? screenshotHeight
				break
		}
		const write = getElementWriter('setString')
		write('variable', variable)
		write('operation', operation)
		write('operand-type', operand.type)
		write('operand-common-value', commonValue)
		write('operand-string-method', stringMethod)
		write('operand-common-variable', commonVariable)
		write('operand-string-char-index', stringCharIndex)
		write('operand-string-slice-begin', stringSliceBegin)
		write('operand-string-slice-end', stringSliceEnd)
		write('operand-string-pad-start-length', stringPadStartLength)
		write('operand-string-pad-start-pad', stringPadStartPad)
		write('operand-string-replace-pattern', stringReplacePattern)
		write('operand-string-replace-replacement', stringReplaceReplacement)
		write('operand-attribute-attributeId', attributeId)
		write('operand-enum-stringId', enumStringId)
		write('operand-object-property', objectProperty)
		write('operand-element-property', elementProperty)
		write('operand-element-element', elementElement)
		write('operand-common-actor', commonActor)
		write('operand-common-skill', commonSkill)
		write('operand-common-trigger', commonTrigger)
		write('operand-common-state', commonState)
		write('operand-common-equipment', commonEquipment)
		write('operand-common-item', commonItem)
		write('operand-object-fileId', objectFileId)
		write('operand-list-index', listIndex)
		write('operand-parameter-key', parameterKey)
		write('operand-script', script)
		write('operand-other-data', otherData)
		write('operand-showChoices-content-choiceIndex', showChoicesIndex)
		write('operand-parse-timestamp-variable', parseTimestampVariable)
		write('operand-parse-timestamp-format', parseTimestampFormat)
		write('operand-screenshot-width', screenshotWidth)
		write('operand-screenshot-height', screenshotHeight)
		$('#setString-variable').getFocus()
	},
	customSave() {
		const read = getElementReader('setString')
		const variable = read('variable')
		if (VariableGetter.isNone(variable)) {
			return $('#setString-variable').getFocus()
		}
		const operation = read('operation')
		const type = read('operand-type')
		let operand
		switch (type) {
			case 'constant':
			case 'template': {
				const value = read('operand-common-value')
				operand = { type, value }
				break
			}
			case 'variable': {
				const variable = read('operand-common-variable')
				if (VariableGetter.isNone(variable)) {
					return $('#setString-operand-common-variable').getFocus()
				}
				operand = { type, variable }
				break
			}
			case 'string': {
				const method = read('operand-string-method')
				const variable = read('operand-common-variable')
				if (VariableGetter.isNone(variable)) {
					return $('#setString-operand-common-variable').getFocus()
				}
				switch (method) {
					case 'char': {
						const index = read('operand-string-char-index')
						operand = { type, method, variable, index }
						break
					}
					case 'slice': {
						const begin = read('operand-string-slice-begin')
						const end = read('operand-string-slice-end')
						operand = { type, method, variable, begin, end }
						break
					}
					case 'pad-start': {
						const length = read('operand-string-pad-start-length')
						const pad = read('operand-string-pad-start-pad')
						operand = { type, method, variable, length, pad }
						break
					}
					case 'replace':
					case 'replace-all': {
						const pattern = read('operand-string-replace-pattern')
						if (pattern === '') {
							return $(
								'#setString-operand-string-replace-pattern'
							).getFocus()
						}
						const replacement = read(
							'operand-string-replace-replacement'
						)
						operand = {
							type,
							method,
							variable,
							pattern,
							replacement
						}
						break
					}
				}
				break
			}
			case 'attribute': {
				const attributeId = read('operand-attribute-attributeId')
				if (attributeId === '') {
					return $(
						'#setString-operand-attribute-attributeId'
					).getFocus()
				}
				operand = { type, attributeId }
				break
			}
			case 'enum': {
				const stringId = read('operand-enum-stringId')
				if (stringId === '') {
					return $('#setString-operand-enum-stringId').getFocus()
				}
				operand = { type, stringId }
				break
			}
			case 'object': {
				const property = read('operand-object-property')
				switch (property) {
					case 'actor-team-id':
					case 'actor-file-id':
					case 'actor-animation-motion-name': {
						const actor = read('operand-common-actor')
						operand = { type, property, actor }
						break
					}
					case 'skill-file-id': {
						const skill = read('operand-common-skill')
						operand = { type, property, skill }
						break
					}
					case 'trigger-file-id': {
						const trigger = read('operand-common-trigger')
						operand = { type, property, trigger }
						break
					}
					case 'state-file-id': {
						const state = read('operand-common-state')
						operand = { type, property, state }
						break
					}
					case 'equipment-file-id':
					case 'equipment-slot': {
						const equipment = read('operand-common-equipment')
						operand = { type, property, equipment }
						break
					}
					case 'item-file-id': {
						const item = read('operand-common-item')
						operand = { type, property, item }
						break
					}
					case 'file-id': {
						const fileId = read('operand-object-fileId')
						if (fileId === '') {
							return $(
								'#setString-operand-object-fileId'
							).getFocus()
						}
						operand = { type, property, fileId }
						break
					}
				}
				break
			}
			case 'element': {
				const property = read('operand-element-property')
				const element = read('operand-element-element')
				operand = { type, property, element }
				break
			}
			case 'list': {
				const variable = read('operand-common-variable')
				const index = read('operand-list-index')
				if (VariableGetter.isNone(variable)) {
					return $('#setString-operand-common-variable').getFocus()
				}
				operand = { type, variable, index }
				break
			}
			case 'parameter': {
				const key = read('operand-parameter-key')
				if (key === '') {
					return $('#setString-operand-parameter-key').getFocus()
				}
				operand = { type, key }
				break
			}
			case 'script': {
				const script = read('operand-script').trim()
				if (script === '') {
					return $('#setString-operand-script').getFocus()
				}
				operand = { type, script }
				break
			}
			case 'other': {
				const data = read('operand-other-data')
				switch (data) {
					case 'showChoices-content': {
						const choiceIndex = read(
							'operand-showChoices-content-choiceIndex'
						)
						operand = { type, data, choiceIndex }
						break
					}
					case 'parse-timestamp': {
						const variable = read(
							'operand-parse-timestamp-variable'
						)
						const format = read('operand-parse-timestamp-format')
						if (VariableGetter.isNone(variable)) {
							return $(
								'#setString-operand-parse-timestamp-variable'
							).getFocus()
						}
						operand = { type, data, variable, format }
						break
					}
					case 'screenshot': {
						const width = read('operand-screenshot-width')
						const height = read('operand-screenshot-height')
						operand = { type, data, width, height }
						break
					}
					default:
						operand = { type, data }
						break
				}
				break
			}
		}
		Command.save({ variable, operation, operand })
	}
})
