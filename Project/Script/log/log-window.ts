import { $ } from '../util/dom.ts';
import { File } from '../file/file-system-core.ts';
import { Editor } from '../main/editor.ts';

import { ipcRenderer } from 'electron';
// ******************************** 日志窗口 ********************************

export const Log = {
	// properties
	box: $('#log-message'),
	list: [],
	devmode: process.argv.includes('--debug-mode'),
	// methods
	initialize: null,
	throw: null,
	print: null,
	clear: null,
	update: null,
	tick: null,
	// runtime 挂载: main/initialize.ts 中挂载警告输出
	warn: null as ((message: string, ...args: any[]) => void) | null,
	// events
	catchError: null,
	catchRejection: null,
	tscLog: null
};

// 初始化
Log.initialize = function () {
	// 定期检查
	setInterval(this.tick, 1000);

	// 侦听事件
	window.on('error', this.catchError);
	window.on('unhandledrejection', this.catchRejection);
	ipcRenderer.on('tsc-log', this.tscLog);
};

// 抛出错误
Log.throw = function (error) {
	if (this.devmode) {
		throw error;
	} else {
		console.error(error);
	}
};

// 输出消息
Log.print = function (item) {
	if (this.list.length < 50) {
		this.list.push(item);
		this.update();
	}
};

// 清除消息
Log.clear = function () {
	this.list.length = 0;
	this.update();
};

// 更新消息
Log.update = function () {
	const { box, list } = this;
	box.clear();
	if (list.length !== 0) {
		for (const item of list) {
			const text = document.createElement('log-item');
			text.innerHTML = item.message;
			text.addClass(item.type);
			box.appendChild(text);
			for (const path of box.querySelectorAll('log-path')) {
				path.onclick = () => {
					const LINE = path.nextElementSibling;
					const COLUMN = LINE.nextElementSibling;
					const file = File.route(path.textContent);
					const line = parseInt(LINE.textContent);
					const column = parseInt(COLUMN.textContent);
					ipcRenderer.send('open-vscode', file, line, column);
				};
			}
		}
		box.addClass('open');
	} else {
		box.removeClass('open');
	}
};

// 定期检查
Log.tick = function () {
	let changed = false;
	const list = Log.list;
	let i = list.length;
	while (--i >= 0) {
		const item = list[i];
		item.duration -= 1;
		if (item.duration <= 0) {
			list.splice(i, 1);
			changed = true;
		}
	}
	if (changed) {
		Log.update();
	}
};

// 捕获同步错误事件
Log.catchError = function (event) {
	if (Editor.state === 'open') {
		Log.print({
			type: 'error',
			message: event.message,
			duration: 6
		});
	}
};

// 捕获异步错误事件
Log.catchRejection = function (event) {
	if (Editor.state === 'open') {
		Log.print({
			type: 'error',
			message: event.reason,
			duration: 6
		});
	}
};

// TSC输出日志
Log.tscLog = function (event, tscMessage) {
	let duration = 6;
	// 清除无效的终端输出格式字符
	let message = tscMessage.replace('[2J[3J[H', '').trim();
	if (message.includes('Starting')) {
		Log.clear();
		duration = 6;
	} else if (message.includes('Found 0 errors')) {
		duration = 6;
	} else if (message.includes('error TS')) {
		message = message.replace(
			/^([^\s]+\.ts)\((\d+),(\d+)\)/gm,
			(match, path, line, column) => {
				const index = path.lastIndexOf('/');
				if (index !== -1) {
					path = `${path.slice(0, index + 1)}<log-strong>${path.slice(index + 1)}</log-strong>`;
				}
				return `<log-path>${path}</log-path>(<log-num>${line}</log-num>,<log-num>${column}</log-num>)`;
			}
		);
		message = message.replace(/(error TS\d+)/g, '<log-weak>$1</log-weak>');
		duration = Infinity;
	} else if (message.includes('Watching for file changes')) {
		duration = Infinity;
	}
	Log.print({
		type: 'log',
		message: message,
		duration: duration
	});
};
