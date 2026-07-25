import { ipcRenderer } from 'electron';
import nodeFs from 'node:fs';

export const FS = nodeFs;
export const FSP = FS.promises;

FSP.writeFile = function (path, text, check = false as any) {
	const { invoke } = ipcRenderer;
	return invoke('write-file', path, text, check);
};
