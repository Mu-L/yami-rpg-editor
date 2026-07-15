'use strict'

// ******************************** 其他 ********************************

// 测量文本大小（带缓存，避免重复强制重排）
export const measureText = (function IIFE() {
	const size = { width: 0, lines: 0 }
	const container = document.createElement('text')
	let appended = false
	let usedFont = ''
	let lineHeight = 0
	container.style.whiteSpace = 'pre'
	// 缓存：key = font + ' ' + text -> { width, lines }
	// 仅缓存较短文本（标签/单位/字符宽度等），避免长动态文本撑大缓存
	const cache = new Map()
	const MAX_CACHE = 4096
	const MAX_CACHE_TEXT = 256
	return function (text, font = '') {
		const cacheable = text.length <= MAX_CACHE_TEXT
		const key = font + ' ' + text
		const cached = cacheable ? cache.get(key) : undefined
		if (cached) {
			size.width = cached.width
			size.lines = cached.lines
			return size
		}
		if (appended === false) {
			appended = true
			document.body.appendChild(container)
			container.textContent = 'a'
			lineHeight = container.offsetHeight
			Promise.resolve().then(() => {
				appended = false
				container.textContent = ''
				container.remove()
			})
		}
		if (usedFont !== font) {
			usedFont = font
			container.style.fontFamily = font ?? ''
		}
		container.textContent = text
		size.width = container.offsetWidth
		size.lines = container.offsetHeight / lineHeight
		if (cacheable) {
			if (cache.size >= MAX_CACHE) cache.clear()
			cache.set(key, { width: size.width, lines: size.lines })
		}
		return size
	}
})()

// 请求执行回调函数(过滤一帧内的重复事件)
export const request = (function IIFE() {
	const callbacks = []
	return function (callback) {
		if (callbacks.append(callback)) {
			requestAnimationFrame(() => {
				if (callbacks.remove(callback)) {
					callback()
				}
			})
		}
	}
})()

// CSS 选择器
export const $ = (function IIFE() {
	const regexp = /^#(\w|-)+$/
	return function (selector) {
		if (regexp.test(selector)) {
			return document.querySelector(selector)
		} else {
			return document.querySelectorAll(selector)
		}
	}
})()

// 获取元素读取器
export const getElementReader = function (prefix) {
	return function (suffix) {
		return $(`#${prefix}-${suffix}`).read()
	}
}

// 获取元素写入器
export const getElementWriter = function (prefix, bindingObject) {
	return function (suffix, value) {
		if (value === undefined) {
			const nodes =
				typeof suffix === 'string' ? suffix.split('-') : [suffix]
			value = bindingObject
			for (const node of nodes) {
				value = value[node]
			}
		}
		$(`#${prefix}-${suffix}`).write(value)
	}
}

window.measureText = measureText
window.request = request
window.$ = $
window.getElementReader = getElementReader
window.getElementWriter = getElementWriter
