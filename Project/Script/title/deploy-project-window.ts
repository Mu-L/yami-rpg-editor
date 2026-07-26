import { $, getElementWriter } from '@/util/dom.ts';
import { Timer } from '@/util/timer.ts';
import { Codec } from '@/codec/codec.ts';
import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { FS, FSP } from '@/file/file-system.ts';
import { FolderItem } from '@/file/folder-item.ts';
import { Log } from '@/log/log-window.ts';
import { Editor } from '@/main/editor.ts';
import { TemplatesPath } from '@/module/global.ts';
import { Local } from '@/tools/localization.ts';
import { Window } from '@/tools/window-object.ts';
import { Path } from '@/util/config.ts';
import uglifyJs from 'uglify-js';
// ESM 下 __dirname 不存在，用 import.meta.url 推算：file: 协议剥两次得 dist/，http/https 兜底 process.cwd()/Project
import { fileURLToPath, URL } from 'node:url';
const _moduleURL = new URL(import.meta.url);
const _modulePath =
	_moduleURL.protocol === 'file:'
		? fileURLToPath(_moduleURL)
		: Path.resolve(process.cwd(), 'Project', _moduleURL.pathname.split('/').pop());
const __dirname =
	_moduleURL.protocol === 'file:'
		? Path.dirname(Path.dirname(_modulePath))
		: Path.resolve(process.cwd(), 'Project');

type DeploymentState = 'passed' | 'open' | 'closed';

// 通用可空方法契约（运行时挂载的具体方法签名各异，统一用宽类型）
type DeploymentMethod = ((...args: any[]) => any) | null;

interface DeploymentShape {
	state: DeploymentState;
	gamedir: string;
	timer: any | null;
	compress: boolean;
	initialize: (() => void) | null;
	open: DeploymentMethod;
	check: DeploymentMethod;
	readShellList: DeploymentMethod;
	readFileList: DeploymentMethod;
	readTsOutDir: DeploymentMethod;
	copyFilesTo: DeploymentMethod;
	compressJavaScript: DeploymentMethod;
	platformInput: DeploymentMethod;
	folderBeforeinput: DeploymentMethod;
	folderInput: DeploymentMethod;
	locationInput: DeploymentMethod;
	chooseClick: DeploymentMethod;
	confirm: DeploymentMethod;
}

export const Deployment: DeploymentShape = {
	state: 'passed',
	gamedir: '',
	timer: null,
	compress: false,
	initialize: null,
	open: null,
	check: null,
	readShellList: null,
	readFileList: null,
	readTsOutDir: null,
	copyFilesTo: null,
	compressJavaScript: null,
	platformInput: null,
	folderBeforeinput: null,
	folderInput: null,
	locationInput: null,
	chooseClick: null,
	confirm: null
};

Deployment.initialize = function () {
	$('#deployment-platform').loadItems([
		{ name: 'Windows x64', value: 'windows-x64' },
		{ name: 'MacOS Universal', value: 'mac-universal' },
		{ name: 'Web / Android / iOS', value: 'web' }
	]);

	$('#deployment-platform').on('input', this.platformInput);
	$('#deployment-folder').on('beforeinput', this.folderBeforeinput, {
		capture: true
	});
	$('#deployment-folder').on('input', this.folderInput);
	$('#deployment-location').on('input', this.locationInput);
	$('#deployment-choose').on('click', this.chooseClick);
	$('#deployment-confirm').on('click', this.confirm);
	$('#deployment-compress').on('change', (e) => {
		Deployment.compress = e.target.read();
	});
};

Deployment.open = function () {
	Window.open('deployment');
	const write = getElementWriter('deployment');
	const dialogs = Editor.config.dialogs;
	const location = Path.normalize(dialogs.deploy);
	write('platform', 'windows-x64');
	write('folder', 'Output');
	write('location', location);
	$('#deployment-platform').getFocus();
	this.check();
};

Deployment.check = function () {
	let folder = $('#deployment-folder').read();
	const location = $('#deployment-location').read();
	const platform = $('#deployment-platform').read();
	if (platform == 'mac-universal') {
		folder += '.app';
	}
	if (!folder) {
		if (this.state !== 'unnamed') {
			this.state = 'unnamed';
			$('#deployment-warning').textContent = Local.get('confirmation.enterFolderName');
			$('#deployment-confirm').disable();
		}
	} else if (FS.existsSync(Path.resolve(location, folder))) {
		if (this.state !== 'existing') {
			this.state = 'existing';
			$('#deployment-warning').textContent = Local.get('confirmation.folderAlreadyExists');
			$('#deployment-confirm').disable();
		}
	} else {
		if (this.state !== 'passed') {
			this.state = 'passed';
			$('#deployment-warning').textContent = '';
			$('#deployment-confirm').enable();
		}
	}
};

Deployment.readShellList = (function IIFE() {
	let root;
	const options = { withFileTypes: true };
	const read = (path, list) => {
		return (FSP.readdir as any)(`${root}${path}`, options).then(async (files: any[]) => {
			if (path) {
				path += '/';
			}
			const promises = [];
			for (const file of files) {
				const newPath = `${path}${file.name}`;
				const srcPath = `${root}${newPath}`;
				if (file.isDirectory()) {
					list.push({
						folder: true,
						shell: true,
						srcPath: srcPath,
						newPath: newPath
					});
					promises.push(read(newPath, list));
				} else {
					list.push({
						shell: true,
						srcPath: srcPath,
						newPath: newPath
					});
				}
			}
			if (promises.length !== 0) {
				await Promise.all(promises);
			}
			return list;
		});
	};
	return function (rootDir) {
		root = Path.resolve(__dirname, rootDir) + '/';
		return read('', []);
	};
})();

Deployment.readFileList = async function (platform) {
	const encrypt = true;
	const tsOutDir = Deployment.readTsOutDir();
	if (!tsOutDir) {
		throw new Error('Unable to get "outDir" from "tsconfig.json".');
	}
	let fileList;
	switch (platform) {
		case 'windows-x64':
			fileList = await this.readShellList(Path.resolve(TemplatesPath, 'electron-win-x64'));
			this.gamedir = 'resources/app/';
			break;
		case 'mac-universal':
			fileList = await this.readShellList(
				Path.resolve(TemplatesPath, 'electron-mac-universal.app')
			);
			this.gamedir = 'Contents/Resources/app/';
			break;
		case 'web':
			fileList = [];
			this.gamedir = '';
			break;
	}
	fileList.push(
		{
			folder: true,
			path: 'Assets'
		},
		{
			folder: true,
			path: 'Module'
		},
		{
			folder: true,
			path: 'Icon'
		},
		{
			folder: true,
			path: 'Data'
		},
		{
			folder: true,
			path: `${tsOutDir}Script`
		}
	);
	const fileIdMap = await Data.createReferencedFileIDMap();
	const manifest = {
		ui: {},
		scenes: {},
		actors: {},
		skills: {},
		items: {},
		equipments: {},
		triggers: {},
		states: {},
		events: {},
		tilesets: {},
		animations: {},
		particles: {},
		images: [],
		audio: [],
		videos: [],
		fonts: [],
		script: [],
		others: []
	};
	for (const key of [
		'ui',
		'scenes',
		'actors',
		'triggers',
		'states',
		'events',
		'tilesets',
		'animations',
		'particles'
	]) {
		const sGroup = Data[key];
		const dGroup = manifest[key];
		for (const guid of Object.keys(sGroup)) {
			if (!fileIdMap[guid]) continue;
			dGroup[guid] = sGroup[guid];
		}
	}
	const guidAndExt = /\.[0-9a-f]{16}\.\S+$/;
	for (const key of ['skills', 'items', 'equipments']) {
		const dataGroup = Data[key];
		const manifestGroup = manifest[key];
		for (const { guid, path } of Data.manifest[key]) {
			if (!fileIdMap[guid]) continue;
			const data = dataGroup[guid];
			if (data !== undefined) {
				manifestGroup[guid] = {
					...data,
					filename: Path.basename(path).replace(guidAndExt, '')
				};
			}
		}
	}
	const config = Object.clone(Data.config);
	config.deployed = true;
	fileList.push(
		{
			data: manifest,
			path: 'Data/manifest.json'
		},
		{
			data: config,
			path: 'Data/config.json'
		},
		{
			data: Data.easings,
			path: 'Data/easings.json'
		},
		{
			data: Data.teams,
			path: 'Data/teams.json'
		},
		{
			data: Data.autotiles,
			path: 'Data/autotiles.json'
		},
		{
			data: Data.variables,
			path: 'Data/variables.json'
		},
		{
			data: Data.attribute,
			path: 'Data/attribute.json'
		},
		{
			data: Data.enumeration,
			path: 'Data/enumeration.json'
		},
		{
			data: Data.localization,
			path: 'Data/localization.json'
		},
		{
			data: Data.plugins,
			path: 'Data/plugins.json'
		},
		{
			data: Data.commands,
			path: 'Data/commands.json'
		}
	);
	fileList.push(
		{
			path: 'Module/axios.min.js'
		},
		{
			path: 'Module/exceljs.min.js'
		}
	);
	fileList.push(
		{ path: 'index.html' },
		{ path: 'Icon/icon.png', encrypt: false },
		{ path: `${tsOutDir}Script/util.js` },
		{ path: `${tsOutDir}Script/loader.js` },
		{ path: `${tsOutDir}Script/codec.js` },
		{ path: `${tsOutDir}Script/webgl.js` },
		{ path: `${tsOutDir}Script/audio.js` },
		{ path: `${tsOutDir}Script/printer.js` },
		{ path: `${tsOutDir}Script/variable.js` },
		{ path: `${tsOutDir}Script/animation.js` },
		{ path: `${tsOutDir}Script/data.js` },
		{ path: `${tsOutDir}Script/local.js` },
		{ path: `${tsOutDir}Script/stage.js` },
		{ path: `${tsOutDir}Script/camera.js` },
		{ path: `${tsOutDir}Script/scene.js` },
		{ path: `${tsOutDir}Script/actor.js` },
		{ path: `${tsOutDir}Script/trigger.js` },
		{ path: `${tsOutDir}Script/filter.js` },
		{ path: `${tsOutDir}Script/input.js` },
		{ path: `${tsOutDir}Script/ui.js` },
		{ path: `${tsOutDir}Script/time.js` },
		{ path: `${tsOutDir}Script/event.js` },
		{ path: `${tsOutDir}Script/command.js` },
		{ path: `${tsOutDir}Script/flow.js` },
		{ path: `${tsOutDir}Script/yami.js` },
		{ path: `${tsOutDir}Script/main.js` }
	);
	const tsExtname = /\.ts$/;
	for (let { guid, path, parameters } of Data.manifest.script) {
		if (!fileIdMap[guid]) continue;
		// 重新映射TS脚本到输出目录的JS脚本
		if (tsExtname.test(path)) {
			path = tsOutDir + path.replace(tsExtname, '.js');
		}
		const newPath = `Assets/${guid}.js`;
		manifest.script.push({
			path: newPath,
			parameters: parameters
		});
		fileList.push({
			srcPath: File.path(path),
			newPath: newPath
		});
	}
	const fontNameRegexp = /([^/]+)\.\S+\.\S+$/;
	for (const key of ['images', 'audio', 'videos', 'fonts', 'others']) {
		const sMetaList = Data.manifest[key];
		const dMetaList = manifest[key];
		for (const { guid, path, size } of sMetaList) {
			if (!fileIdMap[guid]) continue;
			const extname =
				encrypt && key === 'images'
					? '.dat'
					: key === 'audio'
						? '.res'
						: Path.extname(path);
			const newPath = `Assets/${guid}${extname}`;
			if (key === 'fonts') {
				dMetaList.push({
					path: newPath,
					name: path.match(fontNameRegexp)?.[1] ?? ''
				});
			} else {
				dMetaList.push({
					path: newPath,
					size: size
				});
			}
			fileList.push({
				srcPath: File.path(path),
				newPath: newPath
			});
		}
	}
	return fileList;
};

Deployment.readTsOutDir = function () {
	const ts = FS.readFileSync(File.path('tsconfig.json'), 'utf8');
	const match = ts.match(/"outDir"\s*:\s*"(.*?)"/);
	let outDir;
	if (match) {
		outDir = Path.normalize(match[1]);
	}
	if (!outDir.endsWith('/')) {
		outDir += '/';
	}
	return outDir;
};

Deployment.copyFilesTo = function (dirPath) {
	Window.open('copyProgress');
	const platform = $('#deployment-platform').read();
	const progressBar = $('#copyProgress-bar');
	const progressInfo = $('#copyProgress-info');
	const { extnameToTypeMap } = FolderItem;
	progressBar.style.width = '0';
	progressInfo.textContent = '';
	return this.readFileList(platform).then((list) => {
		let total = 0;
		let count = 0;
		let info = '';
		const dPath = `${dirPath}/`;
		const promises = [];
		const length = list.length;
		for (let i = 0; i < length; i++) {
			const item = list[i];
			const srcPath = item.srcPath ?? File.path(item.path);
			const newPath = item.newPath ?? item.path;
			const gamedir = item.shell ? '' : this.gamedir;
			const dstPath = dPath + gamedir + newPath;
			switch (item.folder) {
				case true:
					FS.mkdirSync(dstPath, { recursive: true });
					continue;
				default:
					if (item.data) {
						const json = JSON.stringify(item.data);
						promises.push(
							FSP.writeFile(dstPath, json).then(() => {
								count++;
								info = newPath;
							})
						);
					} else {
						switch (extnameToTypeMap[Path.extname(srcPath).toLowerCase()]) {
							case 'image':
								// 避免加密应用图标文件
								if (item.encrypt === false) {
									break;
								}
								promises.push(
									(async () => {
										const buffer = await FSP.readFile(srcPath);
										await FSP.writeFile(dstPath, Codec.encodeFile(buffer));
										count++;
										info = newPath;
									})()
								);
								continue;
							case 'script':
								if (this.compress && !srcPath.includes('.min.')) {
									promises.push(
										this.compressJavaScript(srcPath, dstPath).then(() => {
											count++;
											info = newPath;
										})
									);
								} else {
									promises.push(
										FSP.copyFile(srcPath, dstPath).then(() => {
											count++;
											info = newPath;
										})
									);
								}
								continue;
						}
						promises.push(
							FSP.copyFile(srcPath, dstPath).then(() => {
								count++;
								info = newPath;
							})
						);
					}
					total++;
					continue;
			}
		}
		this.timer = new Timer({
			duration: Infinity,
			update: () => {
				const percent = Math.round((count / total) * 100);
				progressBar.style.width = `${percent}%`;
				progressInfo.textContent = info;
			}
		}).add();
		return Promise.all(promises);
	});
};

Deployment.compressJavaScript = function (srcPath, dstPath) {
	let uglifyJS;
	try {
		uglifyJS = uglifyJs;
	} catch {
		uglifyJS = null;
	}

	return new Promise((resolve, reject) => {
		if (!uglifyJS) {
			// If uglify-js is not available, just copy the file
			FSP.copyFile(srcPath, dstPath).then(resolve, reject);
			return;
		}
		FSP.readFile(srcPath, 'utf8')
			.then((code) => {
				try {
					const result = uglifyJS.minify(code, {
						mangle: {
							toplevel: false,
							eval: true,
							keep_fnames: false // 不保留函数名
						},
						compress: {
							sequences: true,
							properties: true, // 优化属性访问
							booleans: true, // 优化布尔表达式
							if_return: true, // 优化if/return
							join_vars: true
						},
						output: {
							beautify: false
						},
						sourceMap: false
					});
					if (result.error) {
						reject(result.error);
						throw result.error;
					}
					return resolve(FSP.writeFile(dstPath, result.code));
				} catch {
					// If minification fails, fall back to copying the original file
					FSP.copyFile(srcPath, dstPath).then(resolve, reject);
				}
			})
			.catch(reject);
	});
};

Deployment.platformInput = function () {
	Deployment.check();
};

Deployment.folderBeforeinput = function (event) {
	if (event.inputType === 'insertText' && typeof event.data === 'string') {
		const regexp = /[\\/:*?"<>|"]/;
		if (regexp.test(event.data)) {
			event.preventDefault();
			event.stopPropagation();
		}
	}
};

Deployment.folderInput = function () {
	const regexp = /[\\/:*?"<>|"]/g;
	const oldName = this.read();
	const newName = oldName.replace(regexp, '');
	if (oldName !== newName) {
		this.write(newName);
	}
	Deployment.check();
};

Deployment.locationInput = function () {
	Deployment.check();
};

Deployment.chooseClick = function () {
	const input = $('#deployment-location');
	File.showOpenDialog({
		defaultPath: input.read(),
		properties: ['openDirectory']
	}).then(({ filePaths }) => {
		if (filePaths.length === 1) {
			input.write(filePaths[0]);
			Deployment.check();
		}
	});
};

Deployment.confirm = function () {
	const platform = $('#deployment-platform').read();
	const location = $('#deployment-location').read();
	const folder = $('#deployment-folder').read();
	let path = Path.resolve(location, folder);
	Window.close('deployment');
	if (platform === 'mac-universal') {
		path += '.app';
	}
	return FSP.mkdir(path, { recursive: true })
		.then(() => {
			return Deployment.copyFilesTo(path);
		})
		.finally(() => {
			Window.close('copyProgress');
			if (Deployment.timer) {
				Deployment.timer.remove();
				Deployment.timer = null;
			}
		})
		.then(() => {
			Editor.config.dialogs.deploy = Path.slash(Path.resolve(location));
		})
		.catch((error) => {
			Log.throw(error);
			Window.confirm(
				{
					message: 'Failed to deploy project:\n' + error.message
				},
				[
					{
						label: 'Confirm'
					}
				]
			);
		});
};
