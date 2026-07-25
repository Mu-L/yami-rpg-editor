import { File } from '@/file/file-system-core.ts';
import { Directory } from '@/file/directory-object.ts';
import { Editor } from './editor.ts';
import { Updater } from '@/update/updater.ts';

Editor.checkForEditorUpdates = function () {
	const ver1 = Editor.config.version;
	const ver2 = Updater.latestEditorVersion;
	const verNum1 = Updater.getVersionNumber(ver1);
	const verNum2 = Updater.getVersionNumber(ver2);
	if (verNum1 < verNum2) {
		Editor.config.version = ver2;
		console.warn(`升级编辑器版本：${ver1} -> ${ver2}`);
	}
};

Editor.checkForProjectUpdates = async function () {
	const ver1 = Editor.project.version;
	const ver2 = Updater.latestProjectVersion;
	const verNum1 = Updater.getVersionNumber(ver1);
	const verNum2 = Updater.getVersionNumber(ver2);
	if (verNum1 < verNum2) {
		console.warn(`升级项目版本：${ver1} -> ${ver2}`);
		Updater.updateProject(verNum1);
		Updater.updateConfig(verNum1);
		Updater.updateLocalEvents(verNum1);
		Updater.updateGlobalEvents(verNum1);
		Updater.updateActors(verNum1);
		Updater.updateSkills(verNum1);
		Updater.updateTriggers(verNum1);
		Updater.updateItems(verNum1);
		Updater.updateEquipments(verNum1);
		Updater.updateStates(verNum1);
		Updater.updateScenes(verNum1);
		Updater.updateTilesets(verNum1);
		Updater.updateElements(verNum1);
		Updater.updateAnimations(verNum1);
		Updater.updateParticles(verNum1);
		Updater.updateTeams(verNum1);
		Updater.updateToLatest(ver1);

		await File.save(false);
		Editor.project.version = ver2;

		Directory.update();
		console.log('项目升级完毕!');
	}
};

Editor.isProjectVersionSupported = function () {
	const ver1 = Editor.project.version;
	const ver2 = Updater.latestProjectVersion;
	const verNum1 = Updater.getVersionNumber(ver1);
	const verNum2 = Updater.getVersionNumber(ver2);
	if (verNum1 <= verNum2) {
		return true;
	}
};
