import { Updater } from './updater.ts';
import { Editor } from '../main/editor.ts';

Updater.updateProject = function (verNum) {
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		if (!Editor.project.openEvents) {
			Editor.project.openEvents = [];
		}
		if (!Editor.project.uiPrefabs) {
			Editor.project.uiPrefabs = [];
		}
	}
};
