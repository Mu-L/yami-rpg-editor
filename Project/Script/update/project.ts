import { Updater } from './updater.ts';
import { Editor } from '../main/editor.ts';

// 更新项目数据
Updater.updateProject = function (verNum) {
	// 更新到1.0.122版本
	// 添加openEvents属性
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		if (!Editor.project.openEvents) {
			Editor.project.openEvents = [];
		}
		if (!Editor.project.uiPrefabs) {
			Editor.project.uiPrefabs = [];
		}
	}
};
