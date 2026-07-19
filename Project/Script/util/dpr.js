// ******************************** 检测设备像素比例 ********************************

// 侦听像素比率改变事件
window.on(
	'resize',
	(function IIFE() {
		let dpr = window.devicePixelRatio
		return (event) => {
			if (dpr !== window.devicePixelRatio) {
				dpr = window.devicePixelRatio
				window.dispatchEvent(new Event('dprchange'))
			}
		}
	})()
)
