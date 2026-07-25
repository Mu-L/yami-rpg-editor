import { SettingConfig } from '../module/settingconfig.ts';
import { $ } from '../util/dom.ts';
import { Path } from '../util/config.ts';
import { File } from '../file/file-system-core.ts';
import { Menu } from '../components/menu-list.ts';
import { FS, FSP } from '../file/file-system.ts';
import { Layout } from '../layout/layout.ts';
import { Editor } from '../main/editor.ts';
import { Title } from './title-bar.ts';
import { Local } from '../tools/localization.ts';

// 通用可空方法契约（运行时挂载的具体方法签名各异，统一用宽类型）
type HomeMethod = ((...args: any[]) => any) | null;

interface HomeShape {
	initialize: (() => void) | null;
	updateCenterPosition: HomeMethod;
	parseRecentProjects: HomeMethod;
	removeRecentProject: HomeMethod;
	readFileList: HomeMethod;
	countFileList: HomeMethod;
	windowResize: HomeMethod;
	windowLocalize: HomeMethod;
	startClick: HomeMethod;
	recentClick: HomeMethod;
	recentPointerup: HomeMethod;
}

export const Home: HomeShape = {
	initialize: null,
	updateCenterPosition: null,
	parseRecentProjects: null,
	removeRecentProject: null,
	readFileList: null,
	countFileList: null,
	windowResize: null,
	windowLocalize: null,
	startClick: null,
	recentClick: null,
	recentPointerup: null
};

Home.initialize = function () {
	window.on('resize', this.windowResize);
	window.on('localize', this.windowLocalize);
	$('#home-start-list').on('click', this.startClick);
	$('#home-recent-list').on('click', this.recentClick);
	$('#home-recent-list').on('pointerup', this.recentPointerup);
};

Home.updateCenterPosition = function () {
	if (Layout.manager.index === 'home') {
		const elPage = $('#home');
		const elContent = $('#home-content');
		const pageRect = elPage.rect();
		const contentRect = elContent.rect();
		const left = (pageRect.width - contentRect.width) / 2;
		const top = (pageRect.height - contentRect.height) / 2;
		elContent.style.left = `${left}px`;
		elContent.style.top = `${top}px`;
	}
};

Home.windowResize = function (event) {
	// 不支持page(home):resize事件 先用window:resize代替
	Home.updateCenterPosition();
};

Home.parseRecentProjects = function () {
	const nodes = $('.home-recent-item');
	const items = Editor.config.recent;
	const statsMode =
		typeof SettingConfig !== 'undefined' && SettingConfig.config.recent
			? SettingConfig.config.recent.statsMode
			: 'count';

	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i].clear();
		const item = items[i];
		node.removeClass('disabled');
		if (!item) {
			node.hide();
			continue;
		} else {
			node.show();
		}

		const eBar = document.createElement('box');
		eBar.addClass('home-recent-bar');
		node.appendChild(eBar);

		const eTitle = document.createElement('text');
		eTitle.addClass('home-recent-title');
		eBar.appendChild(eTitle);

		const eDate = document.createElement('text');
		const date = new Date(item.date);
		const Y = date.getFullYear();
		const M = date.getMonth() + 1;
		const D = date.getDate();
		const h = date.getHours();
		const m = date.getMinutes();
		const m2 = m.toString().padStart(2, '0');
		eDate.addClass('home-recent-date');
		eDate.textContent = `${Y}/${M}/${D} ${h}:${m2}`;
		eBar.appendChild(eDate);

		const ePath = document.createElement('text');
		const path = item.path;
		ePath.addClass('home-recent-path');
		ePath.textContent = Path.normalize(path);
		node.appendChild(ePath);

		const eStat = document.createElement('box');
		eStat.addClass('home-recent-stat');
		node.appendChild(eStat);

		const dirname = Path.dirname(path);
		new Promise((resolve, reject) => {
			if (FS.existsSync(path)) {
				const dPath = `${dirname}/data/config.json`;
				resolve(FSP.readFile(dPath, 'utf8'));
			} else {
				reject(new URIError());
			}
		})
			.then((data) => {
				const { window } = JSON.parse(data as any);
				eTitle.textContent = window.title;

				// 根据配置选择使用readFileList或countFileList
				if (statsMode === 'size') {
					return this.readFileList(dirname);
				} else {
					return this.countFileList(dirname);
				}
			})
			.then((list) => {
				const counts = {
					folder: 0,
					data: 0,
					script: 0,
					image: 0,
					media: 0,
					other: 0,
					total: 0
				};
				const sizes = {
					folder: 0,
					data: 0,
					script: 0,
					image: 0,
					media: 0,
					other: 0,
					total: 0
				};
				const length = list.length;
				for (let i = 0; i < length; i++) {
					const { type, size } = list[i];
					counts[type] += 1;
					sizes[type] += size;
				}
				counts.total =
					counts.data + counts.script + counts.image + counts.media + counts.other;
				sizes.total = sizes.data + sizes.script + sizes.image + sizes.media + sizes.other;
				const get = Local.createGetter('stats');
				for (const { type, name } of [
					{ type: 'data', name: get('data') },
					{ type: 'script', name: get('script') },
					{ type: 'image', name: get('image') },
					{ type: 'media', name: get('media') },
					{ type: 'other', name: get('other') },
					{ type: 'total', name: get('total') }
				]) {
					const count = counts[type];
					const size = File.parseFileSize(sizes[type]);

					const eText = document.createElement('text');
					eText.addClass('home-recent-data');

					// 根据统计模式显示不同的信息
					if (statsMode === 'size') {
						eText.textContent = `${name}: ${size}`;
					} else {
						eText.textContent = `${name}: ${count}`;
					}
					eStat.appendChild(eText);
				}
				node.show();
			})
			.catch((error) => {
				node.addClass('disabled');
				if (error instanceof URIError) {
					eTitle.textContent = 'Project does not exist';
				} else {
					eTitle.textContent = 'Failed to load data';
				}
			});
	}
};

Home.removeRecentProject = function (index) {
	const nodes = $('.home-recent-item');
	const items = Editor.config.recent;
	const item = items[index];
	const node = nodes[index];
	if (item && node) {
		items.remove(item);
		node.clear();
		const end = nodes.length - 1;
		for (let i = index; i < end; i++) {
			const sNode = nodes[i + 1];
			const dNode = nodes[i];
			const array = Array.from(sNode.childNodes);
			for (const node of array) {
				dNode.appendChild(node);
			}
			sNode.hasClass('disabled') ? dNode.addClass('disabled') : dNode.removeClass('disabled');
		}
		nodes[items.length].hide();
	}
};

Home.countFileList = (function IIFE() {
	const extnameToTypeMap = {
		'.actor': 'data',
		'.skill': 'data',
		'.trigger': 'data',
		'.item': 'data',
		'.equip': 'data',
		'.state': 'data',
		'.event': 'data',
		'.scene': 'data',
		'.tile': 'data',
		'.ui': 'data',
		'.anim': 'data',
		'.particle': 'data',
		'.json': 'data',
		'.js': 'script',
		'.ts': 'script',
		'.png': 'image',
		'.jpg': 'image',
		'.jpeg': 'image',
		'.cur': 'image',
		'.webp': 'image',
		'.mp3': 'media',
		'.m4a': 'media',
		'.ogg': 'media',
		'.wav': 'media',
		'.flac': 'media',
		'.mp4': 'media',
		'.mkv': 'media',
		'.webm': 'media',
		'.ttf': 'other',
		'.otf': 'other',
		'.woff': 'other',
		'.woff2': 'other'
	};
	const options: any = { withFileTypes: true };
	const read = (path, list) => {
		return FSP.readdir(path, options).then(async (files: any[]) => {
			if (path) {
				path += '/';
			}
			const promises = [];
			for (const file of files) {
				const name = file.name;
				const newPath = `${path}${name}`;
				if (file.isDirectory()) {
					list.push({
						type: 'folder',
						size: 0
					});
					promises.push(read(newPath, list));
				} else {
					const extname = Path.extname(name);
					const type = extnameToTypeMap[extname.toLowerCase()] ?? 'other';
					list.push({
						type: type,
						size: 0
					});
				}
			}
			if (promises.length !== 0) {
				await Promise.all(promises);
			}
			return list;
		});
	};
	return function (path) {
		return read(path, []);
	};
})();

Home.readFileList = (function IIFE() {
	const extnameToTypeMap = {
		'.actor': 'data',
		'.skill': 'data',
		'.trigger': 'data',
		'.item': 'data',
		'.equip': 'data',
		'.state': 'data',
		'.event': 'data',
		'.scene': 'data',
		'.tile': 'data',
		'.ui': 'data',
		'.anim': 'data',
		'.particle': 'data',
		'.json': 'data',
		'.js': 'script',
		'.ts': 'script',
		'.png': 'image',
		'.jpg': 'image',
		'.jpeg': 'image',
		'.cur': 'image',
		'.webp': 'image',
		'.mp3': 'media',
		'.m4a': 'media',
		'.ogg': 'media',
		'.wav': 'media',
		'.flac': 'media',
		'.mp4': 'media',
		'.mkv': 'media',
		'.webm': 'media',
		'.ttf': 'other',
		'.otf': 'other',
		'.woff': 'other',
		'.woff2': 'other'
	};
	const options: any = { withFileTypes: true };
	const read = (path, list) => {
		return FSP.readdir(path, options).then(async (files: any[]) => {
			if (path) {
				path += '/';
			}
			const promises = [];
			for (const file of files) {
				const name = file.name;
				const newPath = `${path}${name}`;
				if (file.isDirectory()) {
					list.push({
						type: 'folder',
						size: 0
					});
					promises.push(read(newPath, list));
				} else {
					const extname = Path.extname(name);
					const type = extnameToTypeMap[extname.toLowerCase()] ?? 'other';
					const item = {
						type: type,
						size: 0
					};
					list.push(item);
					promises.push(
						FSP.stat(newPath).then((stats) => {
							item.size = stats.size;
						})
					);
				}
			}
			if (promises.length !== 0) {
				await Promise.all(promises);
			}
			return list;
		});
	};
	return function (path) {
		return read(path, []);
	};
})();

Home.windowLocalize = function (event) {
	if (Layout.manager.index === 'home') {
		Home.parseRecentProjects();
	}
};

Home.startClick = function (event) {
	const element = event.target;
	if (element.hasClass('home-start-item')) {
		switch (element.getAttribute('value')) {
			case 'new':
				Title.newProject();
				break;
			case 'open':
				Title.openProject();
				break;
		}
	}
};

Home.recentClick = function (event) {
	const element = event.target;
	if (element.hasClass('home-recent-item') && !element.hasClass('disabled')) {
		const index = element.getAttribute('value');
		const items = Editor.config.recent;
		const item = items[parseInt(index)];
		if (item) Editor.open(item.path);
	}
};

Home.recentPointerup = function (event) {
	switch (event.button) {
		case 2: {
			const element = event.target;
			if (
				element.hasClass('home-recent-item') &&
				element.childNodes.length !== 0 &&
				document.activeElement === element.parentNode
			) {
				element.addClass('hover');
				const index = parseInt(element.getAttribute('value'));
				const enabled = !element.hasClass('disabled');
				const get = Local.createGetter('menuRecent');
				Menu.popup(
					{
						x: event.clientX,
						y: event.clientY,
						close: () => {
							element.removeClass('hover');
						}
					},
					[
						{
							label: get('openProject'),
							enabled: enabled,
							click: () => {
								const items = Editor.config.recent;
								const item = items[index];
								if (item) {
									Editor.open(item.path);
								}
							}
						},
						{
							label: get(Local.showInExplorer()),
							enabled: enabled,
							click: () => {
								const items = Editor.config.recent;
								const item = items[index];
								if (item) {
									File.showInExplorer(item.path);
								}
							}
						},
						{
							label: get('removeFromList'),
							click: () => {
								Home.removeRecentProject(index);
							}
						}
					]
				);
			}
			break;
		}
	}
};
