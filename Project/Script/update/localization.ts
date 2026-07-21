import { Data } from '../data/data-object.ts';
import { File } from '../file/file-system-core.ts';
import { FSP } from '../file/file-system.ts';
import { Updater } from './updater.ts';

// 创建本地化数据
Updater.createLocalization = async function (verNum) {
	if (verNum < Updater.getVersionNumber('1.0.54')) {
		const path = File.path('Data/localization.json');
		const json = JSON.stringify({ list: [] }, null, 2);
		await FSP.writeFile(path, json);
	}
};

import path from 'node:path';
