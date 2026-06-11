'use strict'

// ******************************** 区域访问器窗口 ********************************

const RegionGetter = {
	// properties
	target: null,
	// methods
	initialize: null,
	open: null,
	// events
	confirm: null
}

// 初始化
RegionGetter.initialize = function () {
	// 创建访问器类型选项
	$('#regionGetter-type').loadItems([
		{ name: 'Event Trigger Region', value: 'trigger' },
		{ name: 'By Region ID', value: 'by-id' }
	])

	// 设置关联元素
	$('#regionGetter-type')
		.enableHiddenMode()
		.relate([{ case: 'by-id', targets: [$('#regionGetter-presetId')] }])

	// 侦听事件
	$('#regionGetter-confirm').on('click', this.confirm)
}

// 打开窗口
RegionGetter.open = function (target) {
	this.target = target
	Window.open('regionGetter')

	let presetId = PresetObject.getDefaultPresetId('region')
	const region = target.dataValue
	switch (region.type) {
		case 'trigger':
			break
		case 'by-id':
			presetId = region.presetId
			break
	}
	$('#regionGetter-type').write(region.type)
	$('#regionGetter-presetId').write(presetId)
	$('#regionGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
RegionGetter.confirm = function (event) {
	const read = getElementReader('regionGetter')
	const type = read('type')
	let getter
	switch (type) {
		case 'trigger':
			getter = { type }
			break
		case 'by-id': {
			const presetId = read('presetId')
			if (presetId === '') {
				return $('#regionGetter-presetId').getFocus()
			}
			getter = { type, presetId }
			break
		}
	}
	this.target.input(getter)
	Window.close('regionGetter')
}.bind(RegionGetter)
