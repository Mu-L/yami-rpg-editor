import * as monaco from 'monaco-editor';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import 'monaco-editor/esm/vs/editor/contrib/contextmenu/browser/contextmenu.js'; // 右键显示菜单
import 'monaco-editor/esm/vs/editor/contrib/folding/browser/folding.js'; // 折叠
import 'monaco-editor/esm/vs/editor/contrib/format/browser/formatActions.js'; // 格式化代码
import 'monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestController.js'; // 代码联想提示
import 'monaco-editor/esm/vs/editor/contrib/tokenization/browser/tokenization.js'; // 代码联想提示
import 'monaco-editor/esm/nls.messages.zh-cn.js'; // 中文语言
self.MonacoEnvironment = {
	getWorker: function (_, label) {
		switch (label) {
			case 'json':
				return new jsonWorker();
			case 'typescript':
			case 'javascript':
				return new tsWorker();
			default:
				return new editorWorker();
		}
	}
};

export default monaco;
