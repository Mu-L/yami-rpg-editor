import { ipcRenderer } from 'electron';

// Clipboard 是浏览器内置 interface, 直接 `(Clipboard as any).has = ...` 形式 TS 不允许给静态 interface 赋值新属性. 用 Object.assign 触发 type-safe 赋值.
// 用 sendSync 同步接口: 调用方都按同步读取 (const copy = Clipboard.read(...)) 使用, invoke 返回 Promise 会导致 copy.id 等访问到 undefined. 主进程 clipboard.readBuffer/writeBuffer 本身就是同步 API, 走 sendSync + event.returnValue 即可
Object.assign(Clipboard, {
	has(format: string): boolean {
		return ipcRenderer.sendSync('clipboard-has', format) as boolean;
	},
	read(format: string): any {
		return ipcRenderer.sendSync('clipboard-read', format);
	},
	write(format: string, object: any): void {
		ipcRenderer.sendSync('clipboard-write', format, object);
	}
});
