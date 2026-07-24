// ******************************** CSS静态方法 ********************************

// CSS 是全局 interface, TS 不允许直接给静态 interface 赋值新属性.
// 这里用 `declare global` 已扩展 CSS interface, 但运行时挂载仍需
// 通过 Object.assign(CSS, {...}) 形式触发 type-safe 赋值.
Object.assign(CSS, {
	// 编码字符串为URL
	encodeURL: (function IIFE() {
		const regexp = /([()])/g;
		return function (string: string) {
			return `url(${encodeURI(string).replace(regexp, '\\$1')})`;
		};
	})(),
	// 光栅化 CSS 像素坐标使其对齐到设备像素
	rasterize(csspx: number) {
		const dpr = window.devicePixelRatio;
		return Math.round(csspx * dpr) / dpr;
	},
	// 获取设备像素内容框大小
	getDevicePixelContentBoxSize(element: HTMLElement) {
		const rect = element.getBoundingClientRect();
		const dpr = window.devicePixelRatio;
		const left = Math.round(rect.left * dpr + 1e-5);
		const right = Math.round(rect.right * dpr + 1e-5);
		const top = Math.round(rect.top * dpr + 1e-5);
		const bottom = Math.round(rect.bottom * dpr + 1e-5);
		const width = right - left;
		const height = bottom - top;
		return { width, height };
	}
});
