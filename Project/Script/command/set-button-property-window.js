'use strict'

// ******************************** 设置按钮 - 属性窗口 ********************************

export const ButtonProperty = {
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
ButtonProperty.initialize = function () {
	// 创建属性选项
	$('#setButton-property-key').loadItems([
		{ name: 'Normal Image', value: 'normalImage' },
		{ name: 'Hover Image', value: 'hoverImage' },
		{ name: 'Active Image', value: 'activeImage' },
		{ name: 'Normal Clip', value: 'normalClip' },
		{ name: 'Hover Clip', value: 'hoverClip' },
		{ name: 'Active Clip', value: 'activeClip' },
		{ name: 'Normal Tint', value: 'normalTint' },
		{ name: 'Hover Tint', value: 'hoverTint' },
		{ name: 'Active Tint', value: 'activeTint' },
		{ name: 'Image Opacity', value: 'imageOpacity' },
		{ name: 'Content', value: 'content' },
		{ name: 'Size', value: 'size' },
		{ name: 'Letter Spacing', value: 'letterSpacing' }
	])

	// 设置属性关联元素
	$('#setButton-property-key')
		.enableHiddenMode()
		.relate([
			{
				case: ['normalImage', 'hoverImage', 'activeImage'],
				targets: [$('#setButton-property-image')]
			},
			{
				case: ['normalClip', 'hoverClip', 'activeClip'],
				targets: [$('#setButton-property-clip-box')]
			},
			{
				case: ['normalTint', 'hoverTint', 'activeTint'],
				targets: [$('#setButton-property-tint-box')]
			},
			{
				case: 'imageOpacity',
				targets: [$('#setButton-property-imageOpacity')]
			},
			{ case: 'content', targets: [$('#setButton-property-content')] },
			{ case: 'size', targets: [$('#setButton-property-size')] },
			{
				case: 'letterSpacing',
				targets: [$('#setButton-property-letterSpacing')]
			}
		])

	// 侦听事件
	$('#setButton-property-confirm').on('click', this.confirm)
}

// 解析属性
ButtonProperty.parse = function ({ key, value }, listData) {
	let string
	const get = Local.createGetter('command.setButton')
	const name = get(key)
	switch (key) {
		case 'normalImage':
		case 'hoverImage':
		case 'activeImage':
			string =
				name + Token('(') + Command.parseFileName(value) + Token(')')
			break
		case 'normalClip':
		case 'hoverClip':
		case 'activeClip':
		case 'normalTint':
		case 'hoverTint':
		case 'activeTint': {
			const params = [
				Command.setNumberColor(value[0]),
				Command.setNumberColor(value[1]),
				Command.setNumberColor(value[2]),
				Command.setNumberColor(value[3])
			]
			string = name + Token('(') + params.join(Token(', ')) + Token(')')
			break
		}
		case 'content':
			string =
				name +
				Token('(') +
				Command.parseVariableTemplate(value) +
				Token(')')
			break
		case 'imageOpacity':
		case 'size':
		case 'letterSpacing':
			string =
				name + Token('(') + Command.setNumberColor(value) + Token(')')
			break
	}
	if (listData) {
		string = Command.removeTextTags(string)
	}
	return string
}

// 打开数据
ButtonProperty.open = function ({ key = 'normalImage', value = '' } = {}) {
	Window.open('setButton-property')
	const write = getElementWriter('setButton-property')
	let image = ''
	let clip = [0, 0, 0, 0]
	let tint = [0, 0, 0, 0]
	let imageOpacity = 1
	let content = ''
	let size = 16
	let letterSpacing = 0
	switch (key) {
		case 'normalImage':
		case 'hoverImage':
		case 'activeImage':
			image = value
			break
		case 'normalClip':
		case 'hoverClip':
		case 'activeClip':
			clip = value
			break
		case 'normalTint':
		case 'hoverTint':
		case 'activeTint':
			tint = value
			break
		case 'imageOpacity':
			imageOpacity = value
			break
		case 'content':
			content = value
			break
		case 'size':
			size = value
			break
		case 'letterSpacing':
			letterSpacing = value
			break
	}
	write('key', key)
	write('image', image)
	write('clip-0', clip[0])
	write('clip-1', clip[1])
	write('clip-2', clip[2])
	write('clip-3', clip[3])
	write('tint-0', tint[0])
	write('tint-1', tint[1])
	write('tint-2', tint[2])
	write('tint-3', tint[3])
	write('imageOpacity', imageOpacity)
	write('content', content)
	write('size', size)
	write('letterSpacing', letterSpacing)
	$('#setButton-property-key').getFocus()
}

// 保存数据
ButtonProperty.save = function () {
	const read = getElementReader('setButton-property')
	const key = read('key')
	let value
	switch (key) {
		case 'normalImage':
		case 'hoverImage':
		case 'activeImage':
			value = read('image')
			break
		case 'normalClip':
		case 'hoverClip':
		case 'activeClip':
			value = [
				read('clip-0'),
				read('clip-1'),
				read('clip-2'),
				read('clip-3')
			]
			break
		case 'normalTint':
		case 'hoverTint':
		case 'activeTint':
			value = [
				read('tint-0'),
				read('tint-1'),
				read('tint-2'),
				read('tint-3')
			]
			break
		case 'imageOpacity':
			value = read('imageOpacity')
			break
		case 'content':
			value = read('content')
			break
		case 'size':
			value = read('size')
			break
		case 'letterSpacing':
			value = read('letterSpacing')
			break
	}
	Window.close('setButton-property')
	return { key, value }
}

// 确定按钮 - 鼠标点击事件
ButtonProperty.confirm = function (event) {
	return ButtonProperty.target.save()
}

window.ButtonProperty = ButtonProperty
