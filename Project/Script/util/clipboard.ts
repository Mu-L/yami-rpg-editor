import { ipcRenderer } from 'electron';

// ******************************** 剪贴板对象 ********************************

// Clipboard 是浏览器内置 interface, 直接 `(Clipboard as any).has = ...` 形式
// TS 不允许给静态 interface 赋值新属性. 用 Object.assign 触发 type-safe 赋值.
// clipboard.readBuffer/writeBuffer 在渲染进程已 deprecated，经 IPC 委托至主进程
Object.assign(Clipboard, {
	// 检查缓冲区
	has(format: string) {
		return ipcRenderer.invoke('clipboard-has', format) as Promise<boolean>;
	},
	// 读取缓冲区
	read(format: string) {
		return ipcRenderer.invoke('clipboard-read', format) as Promise<any>;
	},
	// 写入缓冲区
	write(format: string, object: any) {
		return ipcRenderer.invoke('clipboard-write', format, object) as Promise<void>;
	}
});
