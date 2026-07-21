// ******************************** 更新管理器 ********************************

export const Updater = {
	// properties
	latestEditorVersion: '1.0.18',
	latestProjectVersion: '1.0.147',
	// methods
	updateProject: null,
	updateConfig: null,
	updateLocalEvents: null,
	updateGlobalEvents: null,
	updateGlobalEvent: null,
	updateActors: null,
	updateSkills: null,
	updateTriggers: null,
	updateItems: null,
	updateEquipments: null,
	updateStates: null,
	updateScenes: null,
	updateTilesets: null,
	updateElements: null,
	updateAnimations: null,
	updateParticles: null,
	updateTeams: null,
	createLocalization: null,
	backupProject: null,
	updateToLatest: null,
	updateIncrementalChanges: null,
	getTsVersionWarning: null,
	getVersionNumber: null
};

// 获取版本数值
Updater.getVersionNumber = function (version) {
	if (!version) return 0;
	const nodes = version.split('.');
	const a = parseInt(nodes[0]);
	const b = parseInt(nodes[1]);
	const c = parseInt(nodes[2]);
	return a * 100000000 + b * 10000 + c;
};
