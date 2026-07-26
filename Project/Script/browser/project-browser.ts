import { $ } from '@/util/dom.ts';
import { Path } from '@/util/config.ts';
import { EventEditor } from '@/command/event-editor.ts';
import { Menu } from '@/components/menu-list.ts';
import { Data } from '@/data/data-object.ts';
import { Directory } from '@/file/directory-object.ts';
import { FileItem } from '@/file/file-item.ts';
import { File } from '@/file/file-system-core.ts';
import { FSP } from '@/file/file-system.ts';
import { FolderItem } from '@/file/folder-item.ts';
import { GUID } from '@/file/guid.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Layout } from '@/layout/layout.ts';
import { Reference } from '@/log/related-references.ts';
import { Editor } from '@/main/editor.ts';
import { TemplatesPath } from '@/module/global.ts';
import { Title } from '@/title/title-bar.ts';
import { Local } from '@/tools/localization.ts';
import { ctrl } from '@/util/event-accessors.ts';
import child_process from 'node:child_process';

import '../components/file-browser.js';
const Browser = $('#project-browser');
export { Browser };
Browser.page = $('#project');
Browser.searcher = null;
Browser.initialize = null;
Browser.unselect = null;
Browser.updateHead = null;
Browser.openScript = null;
Browser.createFile = null;
Browser.createScript = null;
Browser.updateNavVisibility = null;
Browser.saveToProject = null;
Browser.loadFromProject = null;
Browser.pageResize = null;
Browser.bodyKeydown = null;
Browser.bodyOpen = null;
Browser.bodySelect = null;
Browser.bodyUnselect = null;
Browser.bodyPopup = null;

Browser.initialize = function () {
	this.searcher = this.links.head.searcher;
	this.searcher.addKeydownFilter();

	this.page.on('resize', this.pageResize);
	this.body.on('keydown', this.bodyKeydown);
	this.body.on('open', this.bodyOpen);
	this.body.on('select', this.bodySelect);
	this.body.on('unselect', this.bodyUnselect);
	this.body.on('popup', this.bodyPopup);
};

Browser.unselect = function (meta) {
	const body = this.body;
	const files = body.selections;
	if (files.length === 1 && files[0].meta === meta) {
		body.unselect();
	}
};

Browser.updateHead = function () {
	const { page, head } = this;
	if (page.hasClass('visible')) {
		const { nav } = Layout.getGroupOfElement(head);
		const nRect = nav.rect();
		const iRect = nav.lastChild.rect();
		const left = iRect.right - nRect.left;
		if (head.left !== left) {
			head.left = left;
			head.style.left = `${left}px`;
		}
		const bRect = this.body.rect();
		const padding = Math.max(bRect.left - iRect.right, 0);
		if (head.padding !== padding) {
			head.padding = padding;
			head.style.paddingLeft = `${padding}px`;
		}
	}
};

Browser.openScript = function (filePath) {
	const { mode, path } = Editor.config.scriptEditor;
	switch (mode) {
		case 'by-file-extension':
			File.openPath(File.path(filePath));
			break;
		case 'specified-application':
			if (path) {
				const args = [File.path(filePath)];
				child_process.spawn(path, args);
			}
			break;
	}
};

Browser.createFile = function (filename, data) {
	let guid;
	do {
		guid = GUID.generate64bit();
	} while (Data.manifest.guidMap[guid]);
	const { body } = this;
	const [basename, extname] = filename.split('.');
	const fullname = `${basename}.${guid}.${extname}`;
	const dirname = body.getDirName();
	const path = `${dirname}/${fullname}`;
	const route = File.path(path);
	const json = data instanceof Object ? JSON.stringify(data, null, 2) : data;
	FSP.writeFile(route, json)
		.then(() => {
			return Directory.update();
		})
		.then((changed) => {
			if (changed) {
				const folder = Directory.getFolder(dirname);
				if (folder.path === dirname) {
					this.nav.load(folder);
				}
				const file = Directory.getFile(path);
				if (file?.path === path) {
					body.select(file);
					body.rename(file);
				}
			}
			console.log(`write: ${path}`);
		})
		.catch((error) => {
			console.warn(error);
		});
};

Browser.createScript = function (filename) {
	let guid;
	do {
		guid = GUID.generate64bit();
	} while (Data.manifest.guidMap[guid]);
	const { body } = this;
	const [basename, extname] = filename.split('.');
	const fullname = `${basename}.${guid}.${extname}`;
	const dirname = body.getDirName();
	const path = `${dirname}/${fullname}`;
	const route = File.path(path);
	const source = Path.resolve(TemplatesPath, 'script', filename);
	FSP.copyFile(source, route)
		.then(() => {
			return Directory.update();
		})
		.then((changed) => {
			if (changed) {
				const folder = Directory.getFolder(dirname);
				if (folder.path === dirname) {
					this.nav.load(folder);
				}
				const file = Directory.getFile(path);
				if (file?.path === path) {
					body.select(file);
					body.rename(file);
				}
			}
			console.log(`write: ${path}`);
		})
		.catch((error) => {
			console.warn(error);
		});
};

Browser.updateNavVisibility = function () {
	if (this.page.hasClass('visible')) {
		if (Browser.clientWidth >= 500) {
			if (this.removeClass('hide-nav-pane')) {
				this.nav.update();
			}
		} else {
			this.addClass('hide-nav-pane');
		}
	}
};

Browser.saveToProject = function (project) {
	const { browser } = project;
	const { viewIndex } = this.body;
	const selections = this.nav.getSelections();
	const folders = selections.map((folder) => folder.path);
	// 避免写入初始化错误造成的无效数据
	browser.view = viewIndex ?? browser.view;
	if (folders.length !== 0) {
		browser.folders = folders;
	}
};

Browser.loadFromProject = function (project) {
	const { view, folders } = project.browser;
	const selections = [];
	for (const path of folders) {
		selections.append(Directory.getFolder(path));
	}
	if (selections.length === 0) {
		selections.append(Directory.assets);
	}
	this.directory = [Directory.assets];
	this.body.setViewIndex(view);
	this.nav.load(...selections);
};

Browser.pageResize = function () {
	Browser.updateNavVisibility();
	Browser.updateHead();
	Browser.nav.resize();
	Browser.body.computeGridProperties();
	Browser.body.resize();
	Browser.body.updateContentSize();
};

Browser.bodyKeydown = function (event) {
	if (event.cmdOrCtrlKey) {
		switch (event.code) {
			case 'KeyX':
				this.copyFiles(true);
				break;
			case 'KeyC':
				this.copyFiles();
				break;
			case 'KeyV':
				this.pasteFiles();
				break;
			default:
				return;
		}
		event.stopImmediatePropagation();
	}
};

Browser.bodyOpen = function (event) {
	const file = event.value;
	switch (file.type) {
		case 'scene':
		case 'ui':
		case 'animation':
		case 'particle':
			Title.openTab(file);
			break;
		case 'event': {
			const item = file.data;
			if (item) {
				EventEditor.openGlobalEvent(file.meta.guid);
			}
			break;
		}
		case 'audio':
			Inspector.fileAudio.play();
			break;
		case 'video':
			Inspector.fileVideo.play();
			break;
		case 'script':
			Browser.openScript(file.path);
			break;
		case 'other':
			File.openPath(File.path(file.path));
			break;
	}
};

Browser.bodySelect = function (event) {
	const files = event.value;
	if (files.length === 1 && files[0] instanceof FileItem) {
		const file = files[0];
		const meta = file.meta;
		const type = file.type;
		if (!meta) return;
		switch (type) {
			case 'scene':
				break;
			case 'ui':
				break;
			case 'animation':
				break;
			case 'particle':
				break;
			case 'tileset':
				Inspector.open('fileTileset', file.data, meta);
				break;
			case 'actor':
				Inspector.open('fileActor', file.data, meta);
				break;
			case 'skill':
				Inspector.open('fileSkill', file.data, meta);
				break;
			case 'trigger':
				Inspector.open('fileTrigger', file.data, meta);
				break;
			case 'item':
				Inspector.open('fileItem', file.data, meta);
				break;
			case 'equipment':
				Inspector.open('fileEquipment', file.data, meta);
				break;
			case 'state':
				Inspector.open('fileState', file.data, meta);
				break;
			case 'event':
				Inspector.open('fileEvent', file.data, meta);
				break;
			case 'image':
				Inspector.open('fileImage', file, meta);
				break;
			case 'audio':
				Inspector.open('fileAudio', file, meta);
				break;
			case 'video':
				Inspector.open('fileVideo', file, meta);
				break;
			case 'font':
				Inspector.open('fileFont', file, meta);
				break;
			case 'script':
				Inspector.open('fileScript', file, meta);
				break;
		}
	}
};

// 身体 - 取消选择事件
Browser.bodyUnselect = function (event) {
	if (Inspector.meta !== null) {
		const meta = Inspector.meta;
		const files = event.value;
		// meta有可能从映射表中删除，因此对比路径
		if (files.length === 1 && files[0].path === meta.path) {
			Inspector.close();
		}
	}
};

Browser.bodyPopup = function (event) {
	const items = [];
	const { target } = event.raw;
	const { browser, nav } = this.links;
	const get = Local.createGetter('menuFileBrowser');
	const pastable = (Clipboard as any).has('yami.files');
	let creatable = false;
	if (target.seek('file-body-pane') === this) {
		const folders = nav.selections;
		if (browser.display === 'normal' && folders.length === 1) {
			creatable = true;
			items.push(
				{
					label: get(Local.showInExplorer()),
					click: () => {
						File.openPath(File.path(folders[0].path));
					}
				},
				{
					label: get('paste'),
					accelerator: ctrl('V'),
					enabled: pastable,
					click: () => {
						this.pasteFiles();
					}
				},
				{
					label: get('import'),
					click: () => {
						this.importFiles();
					}
				},
				{
					label: get('find-invalid-references'),
					click: () => {
						Reference.openInvalid();
					}
				},
				{
					label: get('find-unused-references'),
					click: () => {
						Reference.openUnused();
					}
				}
			);
		}
	} else {
		const element = target.seek('file-body-item', 2);
		if (element.tagName === 'FILE-BODY-ITEM' && element.hasClass('selected')) {
			const { selections } = this;
			const { file } = element;
			const single = selections.length === 1;
			if (single && selections[0] instanceof FolderItem) {
				creatable = true;
			}
			let copyable = true;
			for (const file of selections) {
				if (file instanceof FolderItem) {
					copyable = false;
					break;
				}
			}
			items.push({
				label: get(Local.showInExplorer()),
				click: () => {
					this.showInExplorer();
				}
			});
			if (browser.display === 'search') {
				items.push({
					label: get('openFileLocation'),
					enabled: single,
					click: () => {
						this.openFileLocation(file);
					}
				});
			}
			items.push(
				{
					label: get('open'),
					accelerator: 'Enter',
					enabled: single,
					click: () => {
						this.openFile(file);
					}
				},
				{
					label: get('cut'),
					accelerator: ctrl('X'),
					enabled: copyable,
					click: () => {
						this.copyFiles(true);
					}
				},
				{
					label: get('copy'),
					accelerator: ctrl('C'),
					enabled: copyable,
					click: () => {
						this.copyFiles();
					}
				},
				{
					label: get('paste'),
					accelerator: ctrl('V'),
					enabled: pastable,
					click: () => {
						this.pasteFiles(creatable ? selections[0].path : undefined);
					}
				},
				{
					label: get('delete'),
					accelerator: 'Delete',
					enabled: !selections.includes(Directory.assets),
					click: () => {
						this.deleteFiles();
					}
				},
				{
					label: get('rename'),
					accelerator: 'F2',
					enabled: single && file !== Directory.assets,
					click: () => {
						this.rename(file);
					}
				},
				{
					label: get('export'),
					click: () => {
						this.exportFile();
					}
				}
			);
			if (single && file instanceof FileItem) {
				items.push(
					{
						label: get('copy-id'),
						click: () => {
							void navigator.clipboard.writeText(file.meta.guid);
						}
					},
					{
						label: get('find-references'),
						accelerator: 'Alt+LB',
						click: () => {
							Reference.openRelated(file.meta.guid);
						}
					}
				);
			}
			if (file.type === 'script') {
				const { scriptEditor } = Editor.config;
				let { mode, path } = scriptEditor;
				if (path) path = Path.normalize(path);
				items.push({
					label: get('settings'),
					submenu: [
						{
							label: get('openByFileExtension'),
							checked: mode === 'by-file-extension',
							click: () => {
								if (mode !== 'by-file-extension') {
									scriptEditor.mode = 'by-file-extension';
									scriptEditor.path = '';
								}
							}
						},
						{
							label: path ? path : get('specifyTheScriptEditor'),
							checked: mode === 'specified-application',
							click: () => {
								File.showOpenDialog({
									title: 'Browse for application',
									defaultPath: path ? path : undefined,
									filters: [
										{
											name: 'Script Editor',
											extensions: ['exe']
										}
									]
								}).then(({ filePaths }) => {
									if (filePaths.length === 1) {
										scriptEditor.mode = 'specified-application';
										scriptEditor.path = Path.slash(filePaths[0]);
									}
								});
							}
						}
					]
				});
			}
		}
	}
	if (items.length !== 0) {
		if (creatable) {
			items.unshift({
				label: get('create'),
				submenu: [
					{
						label: get('create.folder'),
						click: () => {
							this.createFolder();
						}
					},
					{
						label: get('create.actor'),
						click: () => {
							Browser.createFile('Actor.actor', Inspector.fileActor.create());
						}
					},
					{
						label: get('create.skill'),
						click: () => {
							Browser.createFile('Skill.skill', Inspector.fileSkill.create());
						}
					},
					{
						label: get('create.trigger'),
						click: () => {
							Browser.createFile('Trigger.trigger', Inspector.fileTrigger.create());
						}
					},
					{
						label: get('create.item'),
						click: () => {
							Browser.createFile('Item.item', Inspector.fileItem.create());
						}
					},
					{
						label: get('create.equipment'),
						click: () => {
							Browser.createFile('Equipment.equip', Inspector.fileEquipment.create());
						}
					},
					{
						label: get('create.state'),
						click: () => {
							Browser.createFile('State.state', Inspector.fileState.create());
						}
					},
					{
						label: get('create.scene'),
						click: () => {
							Browser.createFile('Scene.scene', Inspector.fileScene.create());
						}
					},
					{
						label: get('create.ui'),
						click: () => {
							Browser.createFile('UI.ui', Inspector.fileUI.create());
						}
					},
					{
						label: get('create.animation'),
						click: () => {
							Browser.createFile('Animation.anim', Inspector.fileAnimation.create());
						}
					},
					{
						label: get('create.particle'),
						click: () => {
							Browser.createFile(
								'Particle.particle',
								Inspector.fileParticle.create()
							);
						}
					},
					{
						label: get('create.normalTileset'),
						click: () => {
							Browser.createFile(
								'Tileset.tile',
								Inspector.fileTileset.create('normal')
							);
						}
					},
					{
						label: get('create.autoTileset'),
						click: () => {
							Browser.createFile(
								'Tileset.tile',
								Inspector.fileTileset.create('auto')
							);
						}
					},
					{
						label: get('create.event'),
						click: () => {
							Browser.createFile('Event.event', Inspector.fileEvent.create('global'));
						}
					},
					{
						label: get('create.script'),
						submenu: [
							{
								label: get('create.script.global-command'),
								click: () => {
									Browser.createScript('GlobalCommand.ts');
								}
							},
							{
								label: get('create.script.global-plugin'),
								click: () => {
									Browser.createScript('GlobalPlugin.ts');
								}
							},
							{
								label: get('create.script.global-event'),
								click: () => {
									Browser.createScript('GlobalEvent.ts');
								}
							},
							{
								label: get('create.script.object-equipment'),
								click: () => {
									Browser.createScript('ObjectEquipment.ts');
								}
							},
							{
								label: get('create.script.object-item'),
								click: () => {
									Browser.createScript('ObjectItem.ts');
								}
							},
							{
								label: get('create.script.object-skill'),
								click: () => {
									Browser.createScript('ObjectSkill.ts');
								}
							},
							{
								label: get('create.script.object-state'),
								click: () => {
									Browser.createScript('ObjectState.ts');
								}
							},
							{
								label: get('create.script.scene'),
								click: () => {
									Browser.createScript('Scene.ts');
								}
							},
							{
								label: get('create.script.scene-actor'),
								click: () => {
									Browser.createScript('SceneActor.ts');
								}
							},
							{
								label: get('create.script.scene-trigger'),
								click: () => {
									Browser.createScript('SceneTrigger.ts');
								}
							},
							{
								label: get('create.script.scene-region'),
								click: () => {
									Browser.createScript('SceneRegion.ts');
								}
							},
							{
								label: get('create.script.scene-light'),
								click: () => {
									Browser.createScript('SceneLight.ts');
								}
							},
							{
								label: get('create.script.scene-animation'),
								click: () => {
									Browser.createScript('SceneAnimation.ts');
								}
							},
							{
								label: get('create.script.scene-particle'),
								click: () => {
									Browser.createScript('SceneParticle.ts');
								}
							},
							{
								label: get('create.script.scene-parallax'),
								click: () => {
									Browser.createScript('SceneParallax.ts');
								}
							},
							{
								label: get('create.script.scene-tilemap'),
								click: () => {
									Browser.createScript('SceneTilemap.ts');
								}
							},
							{
								label: get('create.script.ui-image'),
								click: () => {
									Browser.createScript('UIImage.ts');
								}
							},
							{
								label: get('create.script.ui-text'),
								click: () => {
									Browser.createScript('UIText.ts');
								}
							},
							{
								label: get('create.script.ui-textBox'),
								click: () => {
									Browser.createScript('UITextBox.ts');
								}
							},
							{
								label: get('create.script.ui-dialogBox'),
								click: () => {
									Browser.createScript('UIDialogBox.ts');
								}
							},
							{
								label: get('create.script.ui-progressBar'),
								click: () => {
									Browser.createScript('UIProgressBar.ts');
								}
							},
							{
								label: get('create.script.ui-button'),
								click: () => {
									Browser.createScript('UIButton.ts');
								}
							},
							{
								label: get('create.script.ui-animation'),
								click: () => {
									Browser.createScript('UIAnimation.ts');
								}
							},
							{
								label: get('create.script.ui-video'),
								click: () => {
									Browser.createScript('UIVideo.ts');
								}
							},
							{
								label: get('create.script.ui-window'),
								click: () => {
									Browser.createScript('UIWindow.ts');
								}
							},
							{
								label: get('create.script.ui-container'),
								click: () => {
									Browser.createScript('UIContainer.ts');
								}
							},
							{
								label: get('create.script.example'),
								click: () => {
									Browser.createScript('Example.ts');
								}
							}
						]
					}
				]
			});
		}
		Menu.popup(
			{
				x: event.clientX,
				y: event.clientY
			},
			items
		);
	}
};
