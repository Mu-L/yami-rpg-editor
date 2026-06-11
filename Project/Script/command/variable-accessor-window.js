'use strict'

// ******************************** 变量访问器窗口 ********************************

const VariableGetter = {
	// properties
	keyBox: $('#variableGetter-preset-key'),
	target: null,
	filter: null,
	types: null,
	// methods
	initialize: null,
	open: null,
	isNone: null,
	loadPresetKeys: null,
	checkDataForPlugin: null,
	createDefaultForPlugin: null,
	createVarListGenerator: null,
	// events
	typeWrite: null,
	typeInput: null,
	confirm: null
}

// 初始化
VariableGetter.initialize = function () {
	// 设置变量类型集合
	const types = {
		local: { name: 'Local', value: 'local' },
		global: { name: 'Global', value: 'global' },
		self: { name: 'Self Variable', value: 'self' },
		actor: { name: 'Actor Attribute', value: 'actor' },
		skill: { name: 'Skill Attribute', value: 'skill' },
		state: { name: 'State Attribute', value: 'state' },
		equipment: { name: 'Equipment Attribute', value: 'equipment' },
		item: { name: 'Item Attribute', value: 'item' },
		element: { name: 'Element Attribute', value: 'element' }
	}
	const allTypes = Object.values(types)
	const writableTypes = allTypes.filter((item) => item.value !== 'item')
	const deletableTypes = writableTypes.filter(
		(item) => item.value !== 'global' && item.value !== 'self'
	)
	const objectTypes = [types.local, types.global, types.element]
	const objectTypes2 = [types.local, types.global]
	this.types = {
		all: allTypes,
		object: objectTypes,
		object2: objectTypes2,
		writable: writableTypes,
		deletable: deletableTypes
	}

	// 设置变量类型关联元素
	const actor = $('#variableGetter-actor')
	const skill = $('#variableGetter-skill')
	const state = $('#variableGetter-state')
	const equipment = $('#variableGetter-equipment')
	const item = $('#variableGetter-item')
	const element = $('#variableGetter-element')
	const commonKey = $('#variableGetter-common-key')
	const presetKey = $('#variableGetter-preset-key')
	const globalKey = $('#variableGetter-global-key')
	$('#variableGetter-type')
		.enableHiddenMode()
		.relate([
			{ case: 'local', targets: [commonKey] },
			{ case: 'global', targets: [globalKey] },
			{ case: 'actor', targets: [actor, presetKey] },
			{ case: 'skill', targets: [skill, presetKey] },
			{ case: 'state', targets: [state, presetKey] },
			{ case: 'equipment', targets: [equipment, presetKey] },
			{ case: 'item', targets: [item, presetKey] },
			{ case: 'element', targets: [element, presetKey] }
		])

	// 变量类型 - 重写设置选项名字方法
	$('#variableGetter-type').setItemNames = function (options) {
		const backup = this.dataItems
		this.dataItems = allTypes
		SelectBox.prototype.setItemNames.call(this, options)
		this.dataItems = backup
	}

	// 侦听事件
	$('#variableGetter-type').on('write', this.typeWrite)
	$('#variableGetter-type').on('input', this.typeInput)
	$('#variableGetter-confirm').on('click', this.confirm)
	TextSuggestion.listen(
		$('#variableGetter-common-key'),
		VariableGetter.createVarListGenerator(this)
	)
}

// 打开窗口
VariableGetter.open = function (target) {
	// 创建变量类型选项
	const types = this.types
	const filter = target.filter
	this.filter = filter
	switch (filter) {
		case 'all':
		case 'boolean':
		case 'number':
		case 'string':
			// 如果已经打开了变量访问器窗口，避免冲突使用新窗口
			if (Window.isWindowOpen('variableGetter')) {
				return VariableGetter2.open(target, filter)
			}
			$('#variableGetter-type').loadItems(types.all)
			$('#variableGetter-global-key').filter = filter
			break
		case 'object':
			// 如果已经打开了变量访问器窗口，避免冲突使用新窗口
			if (Window.isWindowOpen('variableGetter')) {
				return VariableGetter2.open(target, filter)
			}
			// 打开元素访问器时则过滤掉元素属性选项
			$('#variableGetter-type').loadItems(
				!Window.isWindowOpen('elementGetter')
					? types.object
					: types.object2
			)
			$('#variableGetter-global-key').filter = filter
			break
		case 'writable-boolean':
		case 'writable-number':
		case 'writable-string':
			$('#variableGetter-type').loadItems(types.writable)
			$('#variableGetter-global-key').filter = filter.slice(9)
			break
		case 'deletable':
			$('#variableGetter-type').loadItems(types.deletable)
			break
	}

	this.target = target
	Window.open('variableGetter')
	const variable = target.dataValue
	const type = variable.type
	const key = variable.key
	let commonKey = ''
	let presetKey = ''
	let globalKey = ''
	let actor = { type: 'trigger' }
	let skill = { type: 'trigger' }
	let state = { type: 'trigger' }
	let equipment = { type: 'trigger' }
	let item = { type: 'trigger' }
	let element = { type: 'trigger' }
	switch (type) {
		case 'local':
			commonKey = key
			break
		case 'global':
			globalKey = key
			break
		case 'actor':
			this.loadPresetKeys(type)
			actor = variable.actor
			presetKey = key
			break
		case 'skill':
			this.loadPresetKeys(type)
			skill = variable.skill
			presetKey = key
			break
		case 'state':
			this.loadPresetKeys(type)
			state = variable.state
			presetKey = key
			break
		case 'equipment':
			this.loadPresetKeys(type)
			equipment = variable.equipment
			presetKey = key
			break
		case 'item':
			this.loadPresetKeys(type)
			item = variable.item
			presetKey = key
			break
		case 'element':
			this.loadPresetKeys(type)
			element = variable.element
			presetKey = key
			break
	}
	const write = getElementWriter('variableGetter')
	this.keyBox.loadItems(Attribute.getAttributeItems('none'))
	write('type', type)
	write('actor', actor)
	write('skill', skill)
	write('state', state)
	write('equipment', equipment)
	write('item', item)
	write('element', element)
	write('common-key', commonKey)
	write('preset-key', presetKey)
	write('global-key', globalKey)
	$('#variableGetter-type').getFocus()
}

// 判断变量是否为空
VariableGetter.isNone = function (variable) {
	return variable.key === ''
}

// 加载预设属性键
VariableGetter.loadPresetKeys = function (group) {
	let type = undefined
	switch (this.filter) {
		case 'boolean':
		case 'number':
		case 'string':
		case 'object':
			type = this.filter
			break
		case 'writable-boolean':
		case 'writable-number':
		case 'writable-string':
			type = this.filter.split('-')[1]
			break
	}
	this.keyBox.loadItems(Attribute.getAttributeItems(group, type))
}

// 检查插件版本的变量访问器数据有效性
VariableGetter.checkDataForPlugin = function (data) {
	if (data instanceof Object) {
		return data.getter === 'variable'
	}
	return false
}

// 创建插件版本的默认变量访问器
VariableGetter.createDefaultForPlugin = function () {
	return { getter: 'variable', type: 'local', key: '' }
}

// 创建本地变量列表生成器
VariableGetter.createVarListGenerator = function (filterObject) {
	return function () {
		if (!EventEditor.commandList.read()) return []

		// 生成过滤字符串
		const filter = filterObject.filter.includes('boolean')
			? 'boolean'
			: filterObject.filter.includes('number')
				? 'number'
				: filterObject.filter.includes('string')
					? 'string'
					: filterObject.filter.includes('object')
						? 'object'
						: 'any'

		const list = EventEditor.commandList
		const elements = list.elements
		const count = elements.count ?? 0
		const parentMap = new Map()
		const stack = []
		for (let i = 0; i < count; i++) {
			const element = elements[i]
			if (element.dataKey === true && element.dataItem) {
				const indent = element.dataIndent ?? 0
				while (
					stack.length > 0 &&
					stack[stack.length - 1].indent >= indent
				) {
					stack.pop()
				}
				const parent =
					stack.length > 0 ? stack[stack.length - 1].command : null
				if (!parentMap.has(element.dataItem)) {
					parentMap.set(element.dataItem, parent)
				}
				stack.push({ command: element.dataItem, indent })
			}
		}
		const getNamespaceRoot = (command) => {
			let current = command
			while (current) {
				if (
					current.id === 'registerEvent' &&
					current.params?.namespace &&
					current.params?.operation === 'register'
				) {
					return current
				}
				current = parentMap.get(current)
			}
			return null
		}
		const activeIndex = list.active
		const activeElement =
			activeIndex !== null && activeIndex !== undefined
				? elements[activeIndex]
				: null
		const activeCommand =
			activeElement?.dataItem ?? activeElement?.dataParent ?? null
		const activeNamespace = activeCommand
			? getNamespaceRoot(activeCommand)
			: null

		return (list.varList ?? []).filter((item) => {
			// 过滤类型不匹配的变量
			if (
				filter !== 'any' &&
				item.type !== 'any' &&
				filter !== item.type
			) {
				return false
			}
			// 过滤作用域不匹配的变量
			const itemCommand = item.command
			const itemNamespace = itemCommand
				? getNamespaceRoot(itemCommand)
				: null
			return itemNamespace === activeNamespace
		})
	}
}

// 类型写入事件
VariableGetter.typeWrite = function (event) {
	const type = event.value
	switch (type) {
		case 'actor':
		case 'skill':
		case 'state':
		case 'item':
		case 'equipment':
		case 'element':
			VariableGetter.loadPresetKeys(type)
			break
	}
}

// 类型输入事件
VariableGetter.typeInput = function (event) {
	const type = event.value
	switch (type) {
		case 'actor':
		case 'skill':
		case 'state':
		case 'item':
		case 'equipment':
		case 'element': {
			// 重新写入属性键
			const { selectBox } = VariableGetter.keyBox
			const attrName = selectBox.textContent
			selectBox.write(selectBox.read())
			if (selectBox.invalid) {
				// 如果是无效数据，则写入同名属性或第一项作为默认值
				const items = selectBox.dataItems
				let defValue = items[0]?.value
				for (const item of items) {
					if (item.name === attrName) {
						defValue = item.value
						break
					}
				}
				if (defValue !== undefined) {
					selectBox.write(defValue)
				}
			}
			break
		}
	}
}

// 确定按钮 - 鼠标点击事件
VariableGetter.confirm = function (event) {
	const read = getElementReader('variableGetter')
	const type = read('type')
	let getter
	let key
	switch (type) {
		case 'local':
			key = read('common-key').trim()
			if (key === '') {
				return $('#variableGetter-common-key').getFocus()
			}
			break
		case 'global': {
			key = read('global-key')
			if (key === '') {
				return $('#variableGetter-global-key').getFocus()
			}
			const variable = Data.variables.map[key]
			const filter = this.target.filter
			switch (filter) {
				case 'boolean':
				case 'number':
				case 'string':
					if (typeof variable?.value !== filter) {
						return $('#variableGetter-global-key').getFocus()
					}
					break
			}
			break
		}
		case 'actor':
		case 'skill':
		case 'state':
		case 'item':
		case 'equipment':
		case 'element':
			key = read('preset-key')
			if (key === '') {
				return $('#variableGetter-preset-key').getFocus()
			}
			break
	}
	switch (type) {
		case 'local':
		case 'global':
			getter = { type, key }
			break
		case 'self':
			getter = { type }
			break
		case 'actor': {
			const actor = read('actor')
			getter = { type, actor, key }
			break
		}
		case 'skill': {
			const skill = read('skill')
			getter = { type, skill, key }
			break
		}
		case 'state': {
			const state = read('state')
			getter = { type, state, key }
			break
		}
		case 'equipment': {
			const equipment = read('equipment')
			getter = { type, equipment, key }
			break
		}
		case 'item': {
			const item = read('item')
			getter = { type, item, key }
			break
		}
		case 'element': {
			const element = read('element')
			getter = { type, element, key }
			break
		}
	}
	// 如果是插件输入框，额外附加一个属性
	if (this.target.isPluginInput) {
		getter = { getter: 'variable', ...getter }
	}
	this.target.input(getter)
	Window.close('variableGetter')
}.bind(VariableGetter)
