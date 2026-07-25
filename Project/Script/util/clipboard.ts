import { ipcRenderer } from 'electron';

// Clipboard 是浏览器内置 interface, 直接 `(Clipboard as any).has = ...` 形式 TS 不允许给静态 interface 赋值新属性. 用 Object.assign 触发 type-safe 赋值. clipboard.readBuffer/writeBuffer 在渲染进程已 deprecated，经 IPC 委托至主进程
Object.assign(Clipboard, {
	has(format: string) {
		return ipcRenderer.invoke('clipboard-has', format) as Promise<boolean>;
	},
	read(format: string) {
		return ipcRenderer.invoke('clipboard-read', format) as Promise<any>;
	},
	write(format: string, object: any) {
		return ipcRenderer.invoke('clipboard-write', format, object) as Promise<void>;
	}
});
