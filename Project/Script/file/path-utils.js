const require = window.__nodeRequire || window.require
;('use strict')
import { Path } from '../util/config.js'

// ******************************** 路径工具 ********************************

// 转换至斜杠分隔符
Path.slash = (function IIFE() {
	const regexp = /\\/g
	return function (path) {
		if (path.indexOf('\\') !== -1) {
			path = path.replace(regexp, '/')
		}
		return path
	}
})()

// 获取文件扩展名
// Path.ext = function (path) {
//   return path.slice(path.lastIndexOf('.') + 1)
// }

const path = require('path')
