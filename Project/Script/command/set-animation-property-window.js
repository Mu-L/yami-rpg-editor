'use strict'

// ******************************** 设置动画 - 属性窗口 ********************************

const AnimationProperty = {
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
AnimationProperty.initialize = function () {
	// 创建属性选项
	$('#setAnimation-property-key').loadItems([
		{ name: 'Animation', value: 'animation' },
		{ name: 'Animation(from actor)', value: 'animation-from-actor' },
		{ name: 'Motion', value: 'motion' },
		{ name: 'Angle', value: 'angle' },
		{ name: 'Frame', value: 'frame' }
	])

	// 设置属性关联元素
	$('#setAnimation-property-key')
		.enableHiddenMode()
		.relate([
			{
				case: 'animation',
				targets: [$('#setAnimation-property-animation')]
			},
			{
				case: 'animation-from-actor',
				targets: [$('#setAnimation-property-actor')]
			},
			{ case: 'motion', targets: [$('#setAnimation-property-motion')] },
			{ case: 'angle', targets: [$('#setAnimation-property-angle')] },
			{ case: 'frame', targets: [$('#setAnimation-property-frame')] }
		])

	// 侦听事件
	$('#setAnimation-property-confirm').on('click', this.confirm)
}

// 解析属性
AnimationProperty.parse = function ({ key, value }, listData) {
	let string
	const get = Local.createGetter('command.setAnimation')
	const name = get(key)
	switch (key) {
		case 'animation':
			string =
				name + Token('(') + Command.parseFileName(value) + Token(')')
			break
		case 'animation-from-actor':
			string = name + Token('(') + Command.parseActor(value) + Token(')')
			break
		case 'motion':
			string =
				name + Token('(') + Command.parseEnumString(value) + Token(')')
			break
		case 'angle':
		case 'frame':
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
AnimationProperty.open = function ({ key = 'animation', value = '' } = {}) {
	Window.open('setAnimation-property')
	const write = getElementWriter('setAnimation-property')
	let animation = ''
	let actor = { type: 'trigger' }
	let motion = ''
	let angle = 0
	let frame = 0
	switch (key) {
		case 'animation':
			animation = value
			break
		case 'animation-from-actor':
			actor = value
			break
		case 'motion':
			motion = value
			break
		case 'angle':
			angle = value
			break
		case 'frame':
			frame = value
			break
	}
	write('key', key)
	write('animation', animation)
	write('actor', actor)
	write('motion', motion)
	write('angle', angle)
	write('frame', frame)
	$('#setAnimation-property-key').getFocus()
}

// 保存数据
AnimationProperty.save = function () {
	const read = getElementReader('setAnimation-property')
	const key = read('key')
	let value
	switch (key) {
		case 'animation':
			value = read('animation')
			break
		case 'animation-from-actor':
			value = read('actor')
			break
		case 'motion':
			value = read('motion')
			break
		case 'angle':
			value = read('angle')
			break
		case 'frame':
			value = read('frame')
			break
	}
	Window.close('setAnimation-property')
	return { key, value }
}

// 确定按钮 - 鼠标点击事件
AnimationProperty.confirm = function (event) {
	return AnimationProperty.target.save()
}
