// ******************************** 编辑器对象 ********************************

export const Editor = {
	// properties
	state: 'closed',
	config: null,
	project: null,
	// methods
	initialize: null,
	open: null,
	close: null,
	quit: null,
	updatePath: null,
	switchHotkey: null,
	saveConfig: null,
	loadConfig: null,
	saveProject: null,
	loadProject: null,
	saveManifest: null,
	checkForEditorUpdates: null,
	checkForProjectUpdates: null,
	isProjectVersionSupported: null
};

// ESM 迁移兼容：恢复全局绑定（供尚未迁移的文件裸用）
