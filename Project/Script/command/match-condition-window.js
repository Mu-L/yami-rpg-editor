'use strict'

// ******************************** 匹配 - 条件窗口 ********************************

const SwitchCondition = {
	// properties
	target: null,
	// methods
	initialize: null,
	parse: null,
	open: null,
	save: null,
	// events
	confirm: null
}

// 初始化
SwitchCondition.initialize = function () {
	// 创建条件类型选项
	$('#switch-condition-type').loadItems([
		{ name: 'None', value: 'none' },
		{ name: 'Boolean', value: 'boolean' },
		{ name: 'Number', value: 'number' },
		{ name: 'String', value: 'string' },
		{ name: 'Attribute Key', value: 'attribute' },
		{ name: 'Enum String', value: 'enum' },
		{ name: 'Keyboard', value: 'keyboard' },
		{ name: 'Gamepad', value: 'gamepad' },
		{ name: 'Mouse', value: 'mouse' },
		{ name: 'Variable', value: 'variable' }
	])

	// 设置条件类型关联元素
	$('#switch-condition-type')
		.enableHiddenMode()
		.relate([
			{
				case: 'boolean',
				targets: [$('#switch-condition-boolean-value')]
			},
			{ case: 'number', targets: [$('#switch-condition-number-value')] },
			{ case: 'string', targets: [$('#switch-condition-string-value')] },
			{
				case: 'attribute',
				targets: [$('#switch-condition-attribute-attributeId')]
			},
			{ case: 'enum', targets: [$('#switch-condition-enum-stringId')] },
			{
				case: 'keyboard',
				targets: [$('#switch-condition-keyboard-keycode')]
			},
			{
				case: 'gamepad',
				targets: [$('#switch-condition-gamepad-button')]
			},
			{ case: 'mouse', targets: [$('#switch-condition-mouse-button')] },
			{
				case: 'variable',
				targets: [$('#switch-condition-variable-variable')]
			}
		])

	// 创建布尔值常量选项
	$('#switch-condition-boolean-value').loadItems([
		{ name: 'False', value: false },
		{ name: 'True', value: true }
	])

	// 创建鼠标按键选项
	$('#switch-condition-mouse-button').loadItems([
		{ name: 'Left Button', value: 0 },
		{ name: 'Middle Button', value: 1 },
		{ name: 'Right Button', value: 2 },
		{ name: 'Back Button', value: 3 },
		{ name: 'Forward Button', value: 4 }
	])

	// 侦听事件
	$('#switch-condition-confirm').on('click', this.confirm)
}

// 解析条件
SwitchCondition.parse = function (condition, listData) {
	let string
	switch (condition.type) {
		case 'none':
			string = Token('null')
			break
		case 'boolean':
			string = Command.setBooleanColor(condition.value.toString())
			break
		case 'number':
			string = Command.setNumberColor(condition.value.toString())
			break
		case 'string':
			string = Command.setStringColor(
				`"${Command.parseMultiLineString(condition.value)}"`
			)
			break
		case 'attribute':
			string = Command.parseAttributeTag(condition.attributeId, 'string')
			break
		case 'enum':
			string = Command.parseEnumStringTag(condition.stringId)
			break
		case 'keyboard': {
			const key = condition.keycode
			const keyboard = Local.get('command.switch.keyboard')
			string =
				keyboard + Token('[') + Command.setStringColor(key) + Token(']')
			break
		}
		case 'gamepad': {
			const button = GamepadBox.getButtonName(condition.button)
			const gamepad = Local.get('command.switch.gamepad')
			string =
				gamepad +
				Token('[') +
				Command.setStringColor(button) +
				Token(']')
			break
		}
		case 'mouse': {
			const button = IfCondition.parseMouseButton(condition.button)
			const mouse = Local.get('command.switch.mouse')
			string =
				mouse + Token('[') + Command.setStringColor(button) + Token(']')
			break
		}
		case 'variable':
			string = Command.parseVariable(condition.variable, 'any')
			break
	}
	if (listData) {
		string = Command.removeTextTags(string)
	}
	return string
}

// 打开数据
SwitchCondition.open = function (condition = { type: 'number', value: 0 }) {
	Window.open('switch-condition')
	let booleanValue = false
	let numberValue = 0
	let stringValue = ''
	let attributeId = ''
	let enumStringId = ''
	let keyboardKeycode = ''
	let gamepadButton = -1
	let mouseButton = 0
	let variableVariable = { type: 'local', key: '' }
	const write = getElementWriter('switch-condition')
	switch (condition.type) {
		case 'none':
			break
		case 'boolean':
			booleanValue = condition.value
			break
		case 'number':
			numberValue = condition.value
			break
		case 'string':
			stringValue = condition.value
			break
		case 'attribute':
			attributeId = condition.attributeId
			break
		case 'enum':
			enumStringId = condition.stringId
			break
		case 'keyboard':
			keyboardKeycode = condition.keycode
			break
		case 'gamepad':
			gamepadButton = condition.button
			break
		case 'mouse':
			mouseButton = condition.button
			break
		case 'variable':
			variableVariable = condition.variable
			break
	}
	write('type', condition.type)
	write('boolean-value', booleanValue)
	write('number-value', numberValue)
	write('string-value', stringValue)
	write('attribute-attributeId', attributeId)
	write('enum-stringId', enumStringId)
	write('keyboard-keycode', keyboardKeycode)
	write('gamepad-button', gamepadButton)
	write('mouse-button', mouseButton)
	write('variable-variable', variableVariable)
	$('#switch-condition-type').getFocus()
}

// 保存数据
SwitchCondition.save = function () {
	const read = getElementReader('switch-condition')
	const type = read('type')
	let condition
	switch (type) {
		case 'none':
			condition = { type }
			break
		case 'boolean': {
			const value = read('boolean-value')
			condition = { type, value }
			break
		}
		case 'number': {
			const value = read('number-value')
			condition = { type, value }
			break
		}
		case 'string': {
			const value = read('string-value')
			condition = { type, value }
			break
		}
		case 'attribute': {
			const attributeId = read('attribute-attributeId')
			if (attributeId === '') {
				return $('#switch-condition-attribute-attributeId').getFocus()
			}
			condition = { type, attributeId }
			break
		}
		case 'enum': {
			const stringId = read('enum-stringId')
			if (stringId === '') {
				return $('#switch-condition-enum-stringId').getFocus()
			}
			condition = { type, stringId }
			break
		}
		case 'keyboard': {
			const keycode = read('keyboard-keycode')
			if (keycode === '') {
				return $('#switch-condition-keyboard-keycode').getFocus()
			}
			condition = { type, keycode }
			break
		}
		case 'gamepad': {
			const button = read('gamepad-button')
			if (button === -1) {
				return $('#switch-condition-gamepad-button').getFocus()
			}
			condition = { type, button }
			break
		}
		case 'mouse': {
			const button = read('mouse-button')
			condition = { type, button }
			break
		}
		case 'variable': {
			const variable = read('variable-variable')
			if (VariableGetter.isNone(variable)) {
				return $('#switch-condition-variable-variable').getFocus()
			}
			condition = { type, variable }
			break
		}
	}
	Window.close('switch-condition')
	return condition
}

// 确定按钮 - 鼠标点击事件
SwitchCondition.confirm = function (event) {
	return SwitchCondition.target.save()
}
