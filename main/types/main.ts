// ******************************** main/main.ts ipcMain 契约 ********************************

import type {
	IpcMainInvokeEvent as EIpcMainInvokeEvent,
	IpcMainEvent as EIpcMainEvent
} from 'electron';
import type { ApkConfig } from './apk.ts';

/**
 * Electron IpcMainInvokeEvent / IpcMainEvent 别名。
 *
 * 替代 main/main.js 各 ipcMain.handle/on callback `(event, ...)` 的无类型形参，
 * 收敛为 Electron 原生契约。event 参数访问：
 * - `event.sender` / `event.returnValue`（ipcMain.on） / `event.sender.send()` 等
 */
export type IpcMainInvokeEvent = EIpcMainInvokeEvent;
export type IpcMainEvent = EIpcMainEvent;

/** ipcMain.handle('start-server', (event, config)) 的 config 契约 */
export interface ServerConfig {
	/** 服务器根路径（path.dirname） */
	path: string;
	/** 服务器监听端口 */
	port: number;
}

/** ipcMain.handle('to-excel', (event, { langs, list })) 的 body 契约 */
export interface ToExcelBody {
	/** 语言列表（表头列） */
	langs: string[];
	/** 数据列表（transformList 输入） */
	list: unknown[];
}

/** ipcMain.on('get-dir-path-sync' | 'get-dir-path', (event, location)) 的 location 契约 */
export type DirLocation = 'appData' | 'documents' | 'desktop' | 'appPath';

/** ipcMain.handle('write-file', (event, filePath, text, check)) 的 check 契约（是否检查覆盖） */
export type WriteFileCheck = boolean | undefined;

/** ipcMain.handle('build-apk', (event, config)) 的 config 契约（复用 ApkConfig） */
export type BuildApkConfig = ApkConfig;

/** ipcMain.handle('tsc-file', (event, code)) 的 code 契约（TS 源码字符串） */
export type TscFileCode = string;

/** ipcMain.on('start-tsc', (event, projectDir)) 的 projectDir 契约 */
export type StartTscProjectDir = string;

/**
 * BrowserWindow 扩展属性契约（运行时挂载，基类未声明）。
 *
 * 替代 main/main.ts 中 `editor`/`player`/`window` 变量访问的
 * `send`/`config`/`stopCloseEvent`/`cancelForceClose` 扩展属性。
 */
export interface BrowserWindowExtension {
	/** 发送 IPC 消息到渲染进程 */
	send(channel: string, ...args: unknown[]): void;
	/** 窗口配置对象（运行时挂载） */
	config?: unknown;
	/** 停止关闭事件标志（运行时挂载） */
	stopCloseEvent?: boolean;
	/** 取消强制关闭（运行时挂载方法） */
	cancelForceClose?: () => void;
}
