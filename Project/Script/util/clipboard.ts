import { clipboard } from 'electron';
// ******************************** 剪贴板对象 ********************************

// Clipboard 是浏览器内置 interface, 直接 `(Clipboard as any).has = ...` 形式
// TS 不允许给静态 interface 赋值新属性. 用 Object.assign 触发 type-safe 赋值.
Object.assign(Clipboard, {
	// 检查缓冲区
	has(format: string) {
		const buffer = clipboard.readBuffer(format);
		return buffer.length !== 0;
	},
	// 读取缓冲区
	read(format: string) {
		const buffer = clipboard.readBuffer(format);
		const string = buffer.toString();
		return string ? JSON.parse(string) : null;
	},
	// 写入缓冲区
	write(format: string, object: any) {
		const string = JSON.stringify(object);
		const buffer = Buffer.from(string);
		clipboard.writeBuffer(format, buffer);
	}
});
