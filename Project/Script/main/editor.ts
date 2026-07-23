// ******************************** 编辑器对象 ********************************

// 编辑器状态
type EditorState = 'closed' | 'open';

// 通用可空方法契约（运行时挂载的具体方法签名各异，统一用宽类型）
type EditorMethod = ((...args: any[]) => any) | null;

interface EditorShape {
	// properties
	state: EditorState;
	config: any | null;
	project: any | null;
	// methods
	initialize: (() => void) | null;
	open: EditorMethod;
	close: EditorMethod;
	quit: EditorMethod;
	updatePath: EditorMethod;
	switchHotkey: EditorMethod;
	saveConfig: EditorMethod;
	loadConfig: EditorMethod;
	saveProject: EditorMethod;
	loadProject: EditorMethod;
	saveManifest: EditorMethod;
	checkForEditorUpdates: EditorMethod;
	checkForProjectUpdates: EditorMethod;
	isProjectVersionSupported: EditorMethod;
}

export const Editor: EditorShape = {
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
