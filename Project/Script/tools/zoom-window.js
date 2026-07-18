'use strict'
import { $ } from '../util/dom.js'
import { Window } from './window-object.js'
import { Editor } from '../main/editor.js'
const require = window.__nodeRequire || window.require

// ******************************** 缩放窗口 ********************************

export const Zoom = {
	// methods
	initialize: null,
	getFactor: null,
	open: null,
	// events
	confirm: null
}

// 初始化
Zoom.initialize = function () {
	// 侦听事件
	$('#zoom-confirm').on('click', this.confirm)
}

// 打开窗口
Zoom.open = function () {
	Window.open('zoom')
	$('#zoom-factor').write(this.getFactor())
	$('#zoom-factor').getFocus('all')
}

// 获取缩放系数
Zoom.getFactor = function () {
	return require('electron').webFrame.getZoomFactor()
}

// 确定按钮 - 鼠标点击事件
Zoom.confirm = function (event) {
	Window.close('zoom')
	require('electron').webFrame.setZoomFactor(
		(Editor.config.zoom = $('#zoom-factor').read())
	)
}
