import { clipboard } from 'electron'
// ******************************** 剪贴板对象 ********************************

// 检查缓冲区
Clipboard.has = function (format) {
	const buffer = clipboard.readBuffer(format)
	return buffer.length !== 0
}

// 检查文本
// Clipboard.hasText = function () {
//   return clipboard.readText() !== ''
// }

// 读取缓冲区
Clipboard.read = function (format) {
	const buffer = clipboard.readBuffer(format)
	const string = buffer.toString()
	return string ? JSON.parse(string) : null
}

// 写入缓冲区
Clipboard.write = function (format, object) {
	const string = JSON.stringify(object)
	const buffer = Buffer.from(string)
	clipboard.writeBuffer(format, buffer)
}
