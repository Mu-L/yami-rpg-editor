'use strict'

// ******************************** 文件系统 ********************************

const FS = require('fs')
const FSP = FS.promises

// 重写写入文件方法
FSP.writeFile = function (path, text, check = false) {
	const { invoke } = require('electron').ipcRenderer
	return invoke('write-file', path, text, check)
}
