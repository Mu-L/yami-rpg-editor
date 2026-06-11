'use strict'

// ******************************** 变量访问器窗口2 ********************************

const VariableGetter2 = {
	// properties
	target: null,
	filter: '',
	types: null,
	// methods
	initialize: null,
	open: null,
	// events
	confirm: null
}

// 初始化
VariableGetter2.initialize = function () {
	// 设置对象变量类型关联元素
	$('#variableGetter2-type')
		.enableHiddenMode()
		.relate([
			{ case: 'local', targets: [$('#variableGetter2-common-key')] },
			{ case: 'global', targets: [$('#variableGetter2-global-key')] },
			{
				case: 'element',
				targets: [
					$('#variableGetter2-element'),
					$('#variableGetter2-preset-key')
				]
			}
		])

	// 侦听事件
	$('#variableGetter2-confirm').on('click', this.confirm)
	TextSuggestion.listen(
		$('#variableGetter2-common-key'),
		VariableGetter.createVarListGenerator(this)
	)
}

// 打开窗口
VariableGetter2.open = function (target, filter) {
	this.target = target
	this.filter = filter
	Window.open('variableGetter2')

	// 创建对象变量类型选项
	// 打开元素访问器时则过滤掉元素属性选项
	$('#variableGetter2-type').loadItems(
		filter === 'object' && !Window.isWindowOpen('elementGetter')
			? VariableGetter.types.object
			: VariableGetter.types.object2
	)

	// 设置全局变量类型过滤器
	$('#variableGetter2-global-key').filter = filter

	// 创建元素属性键选项
	$('#variableGetter2-preset-key').loadItems(
		Attribute.getAttributeItems('element', filter)
	)

	const variable = target.dataValue
	const type = variable.type
	let element = { type: 'trigger' }
	let commonKey = ''
	let globalKey = ''
	let presetKey = Attribute.getDefAttributeId('element', filter)
	switch (type) {
		case 'local':
			commonKey = variable.key
			break
		case 'global':
			globalKey = variable.key
			break
		case 'element':
			element = variable.element
			presetKey = variable.key
			break
	}
	const write = getElementWriter('variableGetter2')
	write('type', type)
	write('element', element)
	write('common-key', commonKey)
	write('global-key', globalKey)
	write('preset-key', presetKey)
	$('#variableGetter2-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
VariableGetter2.confirm = function (event) {
	const read = getElementReader('variableGetter2')
	const type = read('type')
	let getter
	switch (type) {
		case 'local': {
			const key = read('common-key').trim()
			if (!key) {
				return $('#variableGetter2-common-key').getFocus()
			}
			getter = { type, key }
			break
		}
		case 'global': {
			const key = read('global-key')
			const variable = Data.variables.map[key]
			if (
				key === '' ||
				(this.filter !== 'all' &&
					typeof variable?.value !== this.filter)
			) {
				return $('#variableGetter2-global-key').getFocus()
			}
			getter = { type, key }
			break
		}
		case 'element': {
			const element = read('element')
			const key = read('preset-key')
			if (key === '') {
				return $('#variableGetter2-preset-key').getFocus()
			}
			getter = { type, element, key }
			break
		}
	}
	this.target.input(getter)
	Window.close('variableGetter2')
}.bind(VariableGetter2)
