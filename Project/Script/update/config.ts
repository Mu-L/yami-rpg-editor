import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Updater } from './updater.ts';

Updater.updateConfig = function (verNum) {
	// 修改font属性为text属性
	if (verNum < Updater.getVersionNumber('1.0.54')) {
		const sConfig = Data.config;
		const dConfig = {};
		for (const key of Object.keys(sConfig)) {
			if (key === 'font') {
				(dConfig as any).text = {
					importedFonts: sConfig.font.imports,
					fontFamily: sConfig.font.default,
					wordWrap: 'break'
				};
			} else {
				switch (key) {
					case 'collision':
						if (!sConfig[key].trigger) {
							sConfig[key].trigger = {
								collideWithActorShape: false
							};
						}
						break;
				}
				dConfig[key] = sConfig[key];
				switch (key) {
					case 'script':
						// 在script属性后添加localization属性
						if (!(sConfig as any).localization) {
							(dConfig as any).localization = {
								languages: ['en', 'zh-CN'],
								default: 'auto'
							};
						}
						break;
				}
			}
		}
		Data.config = dConfig;
		File.planToSave(Data.manifest.project.config);
	}
	if (verNum < Updater.getVersionNumber('1.0.52')) {
		delete Data.config.text.pixelated;
		delete Data.config.text.threshold;
		File.planToSave(Data.manifest.project.config);
	}
	if (verNum < Updater.getVersionNumber('1.0.68')) {
		delete Data.config.collision.actor.ignoreTeamMember;
		File.planToSave(Data.manifest.project.config);
	}
	if (verNum < Updater.getVersionNumber('1.0.102')) {
		Data.config.resolution.sceneScale = 1;
		Data.config.resolution.uiScale = 1;
		Data.config.text.highDefinition = false;
		File.planToSave(Data.manifest.project.config);
	}
	// 修改localization.languages属性为对象
	if (verNum < Updater.getVersionNumber('1.0.115')) {
		delete Data.config.text.wordWrap;
		const { languages } = Data.config.localization;
		for (let i = 0; i < languages.length; i++) {
			if (typeof languages[i] === 'string') {
				languages[i] = {
					name: languages[i],
					font: '',
					scale: 1
				};
			}
		}
		File.planToSave(Data.manifest.project.config);
	}
	// 修改window.display的值: 'window'->'windowed'
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		const { config, events } = Data;
		if (config.deployed === undefined) {
			config.deployed = false;
		}
		if (config.window.display === 'window') {
			config.window.display = 'windowed';
		}
		if (!config.virtualAxis) {
			config.virtualAxis = {
				up: 'KeyW',
				down: 'KeyS',
				left: 'KeyA',
				right: 'KeyD'
			};
		}
		delete config.actor.playerTeam;
		delete config.actor.playerActor;
		delete config.actor.partyMembers;
		delete config.actor.partyInventory;
		if (config.webgl === undefined) {
			config.webgl = { desynchronized: false };
		}
		delete config.script.language;
		delete config.script.outDir;
		config.script.autoCompile = true;
		config.save = {
			location: 'local',
			subdir: config.gameId
		};
		if (config.event) {
			const { startup, loadGame, initScene, showText, showChoices } = config.event;
			if (events[startup]) {
				events[startup].type = 'startup';
			}
			if (events[loadGame]) {
				events[loadGame].type = 'loadsave';
			}
			if (events[initScene]) {
				events[initScene].type = 'createscene';
			}
			if (events[showText]) {
				events[showText].type = 'showtext';
			}
			if (events[showChoices]) {
				events[showChoices].type = 'showchoices';
			}
			delete config.event;
		}
		File.planToSave(Data.manifest.project.config);
	}
	if (verNum < Updater.getVersionNumber('1.0.127')) {
		const { config } = Data;
		if (config.webgl.textureMagFilter === undefined) {
			config.webgl = {
				desynchronized: config.webgl.desynchronized,
				textureMagFilter: 'nearest',
				textureMinFilter: 'linear'
			};
		}
		if (config.preload === undefined) {
			config.preload = 'never';
		}
		File.planToSave(Data.manifest.project.config);
	}
};
