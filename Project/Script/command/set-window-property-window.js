'use strict'

// ******************************** 设置窗口 - 属性窗口 ********************************

export const WindowProperty = {
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
WindowProperty.initialize = function () {
	// 创建属性选项
	$('#setWindow-property-key').loadItems([
		{ name: 'Scroll X', value: 'scrollX' },
		{ name: 'Scroll Y', value: 'scrollY' },
		{ name: 'Grid Width', value: 'gridWidth' },
		{ name: 'Grid Height', value: 'gridHeight' },
		{ name: 'Grid Gap X', value: 'gridGapX' },
		{ name: 'Grid Gap Y', value: 'gridGapY' },
		{ name: 'Padding X', value: 'paddingX' },
		{ name: 'Padding Y', value: 'paddingY' }
	])

	// 设置属性关联元素
	$('#setWindow-property-key')
		.enableHiddenMode()
		.relate([
			{ case: 'scrollX', targets: [$('#setWindow-property-scrollX')] },
			{ case: 'scrollY', targets: [$('#setWindow-property-scrollY')] },
			{
				case: 'gridWidth',
				targets: [$('#setWindow-property-gridWidth')]
			},
			{
				case: 'gridHeight',
				targets: [$('#setWindow-property-gridHeight')]
			},
			{ case: 'gridGapX', targets: [$('#setWindow-property-gridGapX')] },
			{ case: 'gridGapY', targets: [$('#setWindow-property-gridGapY')] },
			{ case: 'paddingX', targets: [$('#setWindow-property-paddingX')] },
			{ case: 'paddingY', targets: [$('#setWindow-property-paddingY')] }
		])

	// 侦听事件
	$('#setWindow-property-confirm').on('click', this.confirm)
}

// 解析属性
WindowProperty.parse = function ({ key, value }, listData) {
	let string
	const get = Local.createGetter('command.setWindow')
	const name = get(key)
	switch (key) {
		case 'scrollX':
		case 'scrollY':
		case 'gridWidth':
		case 'gridHeight':
		case 'gridGapX':
		case 'gridGapY':
		case 'paddingX':
		case 'paddingY':
			string =
				name +
				Token('(') +
				Command.parseVariableNumber(value) +
				Token(')')
			break
	}
	if (listData) {
		string = Command.removeTextTags(string)
	}
	return string
}

// 打开数据
WindowProperty.open = function ({ key = 'scrollX', value = 0 } = {}) {
	Window.open('setWindow-property')
	const write = getElementWriter('setWindow-property')
	let scrollX = 0
	let scrollY = 0
	let gridWidth = 0
	let gridHeight = 0
	let gridGapX = 0
	let gridGapY = 0
	let paddingX = 0
	let paddingY = 0
	switch (key) {
		case 'scrollX':
			scrollX = value
			break
		case 'scrollY':
			scrollY = value
			break
		case 'gridWidth':
			gridWidth = value
			break
		case 'gridHeight':
			gridHeight = value
			break
		case 'gridGapX':
			gridGapX = value
			break
		case 'gridGapY':
			gridGapY = value
			break
		case 'paddingX':
			paddingX = value
			break
		case 'paddingY':
			paddingY = value
			break
	}
	write('key', key)
	write('scrollX', scrollX)
	write('scrollY', scrollY)
	write('gridWidth', gridWidth)
	write('gridHeight', gridHeight)
	write('gridGapX', gridGapX)
	write('gridGapY', gridGapY)
	write('paddingX', paddingX)
	write('paddingY', paddingY)
	$('#setWindow-property-key').getFocus()
}

// 保存数据
WindowProperty.save = function () {
	const read = getElementReader('setWindow-property')
	const key = read('key')
	let value
	switch (key) {
		case 'scrollX':
			value = read('scrollX')
			break
		case 'scrollY':
			value = read('scrollY')
			break
		case 'gridWidth':
			value = read('gridWidth')
			break
		case 'gridHeight':
			value = read('gridHeight')
			break
		case 'gridGapX':
			value = read('gridGapX')
			break
		case 'gridGapY':
			value = read('gridGapY')
			break
		case 'paddingX':
			value = read('paddingX')
			break
		case 'paddingY':
			value = read('paddingY')
			break
	}
	Window.close('setWindow-property')
	return { key, value }
}

// 确定按钮 - 鼠标点击事件
WindowProperty.confirm = function (event) {
	return WindowProperty.target.save()
}

window.WindowProperty = WindowProperty
