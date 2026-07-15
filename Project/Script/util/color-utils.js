'use strict'

// ******************************** 颜色工具函数 ********************************

// 生成整数颜色
export const INTRGBA = function (hex) {
	const r = parseInt(hex.slice(0, 2), 16)
	const g = parseInt(hex.slice(2, 4), 16)
	const b = parseInt(hex.slice(4, 6), 16)
	const a = parseInt(hex.slice(6, 8), 16)
	return r + (g + (b + a * 256) * 256) * 256
}

// 生成CSS颜色
export const CSSRGBA = function (hex) {
	const r = parseInt(hex.slice(0, 2), 16)
	const g = parseInt(hex.slice(2, 4), 16)
	const b = parseInt(hex.slice(4, 6), 16)
	const a = parseInt(hex.slice(6, 8), 16)
	return `rgba(${r}, ${g}, ${b}, ${a})`
}

window.INTRGBA = INTRGBA
window.CSSRGBA = CSSRGBA
