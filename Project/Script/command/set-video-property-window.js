'use strict'

// ******************************** 设置视频 - 属性窗口 ********************************

export const VideoProperty = {
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
VideoProperty.initialize = function () {
	// 创建属性选项
	$('#setVideo-property-key').loadItems([
		{ name: 'Video', value: 'video' },
		{ name: 'Playback Rate', value: 'playbackRate' },
		{ name: 'Loop', value: 'loop' },
		{ name: 'Flip', value: 'flip' },
		{ name: 'Blend', value: 'blend' }
	])

	// 设置属性关联元素
	$('#setVideo-property-key')
		.enableHiddenMode()
		.relate([
			{ case: 'video', targets: [$('#setVideo-property-video')] },
			{
				case: 'playbackRate',
				targets: [$('#setVideo-property-playbackRate')]
			},
			{ case: 'loop', targets: [$('#setVideo-property-loop')] },
			{ case: 'flip', targets: [$('#setVideo-property-flip')] },
			{ case: 'blend', targets: [$('#setVideo-property-blend')] }
		])

	// 创建显示选项
	$('#setVideo-property-loop').loadItems($('#uiVideo-loop').dataItems)

	// 创建翻转选项
	$('#setVideo-property-flip').loadItems($('#uiVideo-flip').dataItems)

	// 创建混合模式选项
	$('#setVideo-property-blend').loadItems($('#uiVideo-blend').dataItems)

	// 侦听事件
	$('#setVideo-property-confirm').on('click', this.confirm)
}

// 解析属性
VideoProperty.parse = function ({ key, value }, listData) {
	let string
	const get = Local.createGetter('command.setVideo')
	const name = get(key).replace('.', Token('.'))
	switch (key) {
		case 'video':
			string =
				name + Token('(') + Command.parseFileName(value) + Token(')')
			break
		case 'playbackRate':
			string =
				name +
				Token('(') +
				Command.parseVariableNumber(value) +
				Token(')')
			break
		case 'loop':
			string = name + Token('(') + get('loop.' + value) + Token(')')
			break
		case 'flip':
			string = name + Token('(') + get('flip.' + value) + Token(')')
			break
		case 'blend':
			string = name + Token('(') + Command.parseBlend(value) + Token(')')
			break
	}
	if (listData) {
		string = Command.removeTextTags(string)
	}
	return string
}

// 打开数据
VideoProperty.open = function ({ key = 'video', value = '' } = {}) {
	Window.open('setVideo-property')
	const write = getElementWriter('setVideo-property')
	let video = ''
	let playbackRate = 1
	let loop = false
	let flip = 'none'
	let blend = 'normal'
	switch (key) {
		case 'video':
			video = value
			break
		case 'playbackRate':
			playbackRate = value
			break
		case 'loop':
			loop = value
			break
		case 'flip':
			flip = value
			break
		case 'blend':
			blend = value
			break
	}
	write('key', key)
	write('video', video)
	write('playbackRate', playbackRate)
	write('loop', loop)
	write('flip', flip)
	write('blend', blend)
	$('#setVideo-property-key').getFocus()
}

// 保存数据
VideoProperty.save = function () {
	const read = getElementReader('setVideo-property')
	const key = read('key')
	let value
	switch (key) {
		case 'video':
			value = read('video')
			break
		case 'playbackRate':
			value = read('playbackRate')
			break
		case 'loop':
			value = read('loop')
			break
		case 'flip':
			value = read('flip')
			break
		case 'blend':
			value = read('blend')
			break
	}
	Window.close('setVideo-property')
	return { key, value }
}

// 确定按钮 - 鼠标点击事件
VideoProperty.confirm = function (event) {
	return VideoProperty.target.save()
}

window.VideoProperty = VideoProperty
