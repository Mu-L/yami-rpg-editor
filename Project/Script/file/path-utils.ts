import { Path } from '../util/config.ts';

// ******************************** 路径工具 ********************************

// 转换至斜杠分隔符
// PlatformPath 是 interface, 直接 `Path.slash = ...` TS 不识别扩展.
// 用 Object.assign 触发 type-safe 静态属性赋值.
Object.assign(Path, {
	slash: (function IIFE() {
		const regexp = /\\/g;
		return function (path: string) {
			if (path.indexOf('\\') !== -1) {
				path = path.replace(regexp, '/');
			}
			return path;
		};
	})()
});

// 获取文件扩展名
// Path.ext = function (path) {
//   return path.slice(path.lastIndexOf('.') + 1)
// }
