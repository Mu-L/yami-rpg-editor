import { Path } from '../util/config.ts';
import { File } from '../file/file-system-core.ts';
import { FS } from '../file/file-system.ts';
import { Updater } from './updater.ts';

Updater.backupProject = function () {
	const projectPath = File.root;
	const folderName = Path.basename(projectPath);
	const backupPath = Path.resolve(projectPath, `../${folderName}.bak`);
	FS.cpSync(projectPath, backupPath, { recursive: true });
};
