// ******************************** 事件访问器 ********************************

Object.defineProperties(Event.prototype, {
	dragKey: {
		get: function () {
			return this.spaceKey || this.altKey
		}
	},
	cmdOrCtrlKey: {
		get:
			process.platform === 'darwin'
				? function () {
						return this.metaKey
					}
				: function () {
						return this.ctrlKey
					}
	},
	macRedoKey: {
		get:
			process.platform === 'darwin'
				? function () {
						return (
							this.metaKey &&
							this.shiftKey &&
							this.code === 'KeyZ'
						)
					}
				: function () {
						return false
					}
	}
})

// 获取Ctrl组合键名称
export const ctrl =
	process.platform === 'darwin'
		? function (keyName) {
				return '⌘+' + keyName
			}
		: function (keyName) {
				return 'Ctrl+' + keyName
			}
