import { Path } from '@/util/config.ts';

// 转换至斜杠分隔符；PlatformPath 是 interface，直接赋值 TS 不识别扩展，用 Object.assign 触发 type-safe 静态属性赋值
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
