'use strict'
const require = window.__nodeRequire || window.require

// ******************************** 文件系统 ********************************

export const FS = require('fs')
export const FSP = FS.promises

// 重写写入文件方法
FSP.writeFile = function (path, text, check = false) {
	const { invoke } = require('electron').ipcRenderer
	return invoke('write-file', path, text, check)
}

window.FS = FS
window.FSP = FSP
