import { ipcRenderer } from 'electron';
import { fs } from '../module/global.ts';
import nodeFs from 'node:fs';

// ******************************** 文件系统 ********************************

export const FS = nodeFs;
export const FSP = FS.promises;

// 重写写入文件方法
FSP.writeFile = function (path, text, check = false as any) {
	const { invoke } = ipcRenderer;
	return invoke('write-file', path, text, check);
};
