'use strict'

// ******************************** OS拖拽处理 ********************************

{
	// 拖拽状态
	let dragging = false
	let osdragging = false

	// 拖拽开始事件 - 阻止拖拽元素
	const dragstart = function (event) {
		dragging = true
		event.preventDefault()
		window.on('pointerup', pointerup)
	}

	// 拖拽结束事件 - 比指针弹起事件优先执行
	const dragend = function (event) {
		if (dragging) {
			dragging = false
			window.off('pointerup', pointerup)
		}
	}

	// 指针弹起事件 - 拖拽被阻止时的备用方案
	const pointerup = function (event) {
		if (dragging) {
			dragging = false
			window.off('pointerup', pointerup)
		}
	}

	// 拖拽进入事件
	const dragenter = function (event) {
		if (!dragging && !osdragging && !event.relatedTarget) {
			osdragging = true
			window.dispatchEvent(new DragEvent('os-dragstart'))
			window.on('dragleave', dragleave)
			window.on('dragover', dragover)
			window.on('drop', drop)
		}
	}

	// 拖拽离开事件
	const dragleave = function (event) {
		if (osdragging && !event.relatedTarget) {
			osdragging = false
			window.dispatchEvent(new DragEvent('os-dragend'))
			window.off('dragleave', dragleave)
			window.off('dragover', dragover)
			window.off('drop', drop)
		}
	}

	// 拖拽悬停事件
	const dragover = function (event) {
		event.preventDefault()
	}

	// 拖拽释放事件
	// 停止冒泡会拦截该事件
	const drop = function (event) {
		if (osdragging) {
			osdragging = false
			window.dispatchEvent(new DragEvent('os-dragend'))
			window.off('dragleave', dragleave)
			window.off('dragover', dragover)
			window.off('drop', drop)
		}
	}

	// 初始化
	window.on('dragstart', dragstart)
	window.on('dragend', dragend)
	window.on('dragenter', dragenter)
}
