import { $, getElementWriter } from '../util/dom.ts';
import { Data } from '../data/data-object.ts';
import { Inspector } from './inspector.ts';
import { Scene } from '../scene/scene-window.ts';
import { ConditionListInterface } from '../tools/condition-list.ts';
import { EventListInterface } from '../tools/event-list.ts';
import { ScriptListInterface } from '../tools/script-list.ts';

{
	const SceneActor = {
		owner: Scene,
		target: null,
		nameBox: $('#sceneActor-name'),
		initialize: null,
		create: null,
		open: null,
		close: null,
		write: null,
		update: null,
		datachange: null,
		paramInput: null,
		typeWrite: null
	};

	SceneActor.initialize = function () {
		$('#sceneActor-type').loadItems([
			{ name: 'Local Actor', value: 'local' },
			{ name: 'Global Actor', value: 'global' }
		]);

		$('#sceneActor-conditions').bind(new ConditionListInterface(this, Scene));

		$('#sceneActor-events').bind(new EventListInterface(this, Scene));

		$('#sceneActor-scripts').bind(new ScriptListInterface(this, Scene));

		$('#sceneActor-parameter-pane').bind($('#sceneActor-scripts'));

		$('#sceneActor-angle-slider').synchronize($('#sceneActor-angle'));
		$('#sceneActor-scale-slider').synchronize($('#sceneActor-scale'));

		window.on('datachange', this.datachange);
		const elements =
			$(`#sceneActor-name, #sceneActor-type, #sceneActor-actorId, #sceneActor-teamId,
    #sceneActor-x, #sceneActor-y, #sceneActor-angle, #sceneActor-scale`);
		const sliders = $('#sceneActor-angle-slider, #sceneActor-scale-slider');
		elements.on('input', this.paramInput);
		elements.on('focus', Inspector.inputFocus);
		elements.on('blur', Inspector.inputBlur(this, Scene));
		sliders.on('focus', Inspector.sliderFocus);
		sliders.on('blur', Inspector.sliderBlur);
		$('#sceneActor-type').on('write', this.typeWrite);
		$('#sceneActor-conditions, #sceneActor-events, #sceneActor-scripts').on(
			'change',
			Scene.listChange
		);
	};

	SceneActor.create = function () {
		return {
			class: 'actor',
			name: 'Actor',
			type: 'local',
			enabled: true,
			hidden: false,
			locked: false,
			presetId: '',
			actorId: '',
			teamId: Data.teams.list[0].id,
			x: 0,
			y: 0,
			angle: 0,
			scale: 1,
			conditions: [],
			events: [],
			scripts: []
		};
	};

	SceneActor.open = function (actor) {
		if (this.target !== actor) {
			this.target = actor;

			const elTeamId = $('#sceneActor-teamId');
			elTeamId.loadItems(Data.createTeamItems());

			const write = getElementWriter('sceneActor', actor);
			write('name');
			write('type');
			write('actorId');
			write('teamId');
			write('x');
			write('y');
			write('angle');
			write('scale');
			write('conditions');
			write('events');
			write('scripts');
		}
	};

	SceneActor.close = function () {
		if (this.target) {
			Scene.list.unselect(this.target);
			Scene.updateTarget();
			this.target = null;
			$('#sceneActor-conditions').clear();
			$('#sceneActor-events').clear();
			$('#sceneActor-scripts').clear();
			$('#sceneActor-parameter-pane').clear();
		}
	};

	SceneActor.write = function (options) {
		if (options.x !== undefined) {
			$('#sceneActor-x').write(options.x);
		}
		if (options.y !== undefined) {
			$('#sceneActor-y').write(options.y);
		}
		if (options.angle !== undefined) {
			$('#sceneActor-angle').write(options.angle);
		}
	};

	SceneActor.update = function (actor, key, value) {
		Scene.planToSave();
		switch (key) {
			case 'name':
				if (actor.name !== value) {
					actor.name = value;
					Scene.updateTargetInfo();
					Scene.list.updateItemName(actor);
				}
				break;
			case 'type':
			case 'x':
			case 'y':
				if (actor[key] !== value) {
					actor[key] = value;
				}
				break;
			case 'actorId':
				if (actor.actorId !== value) {
					actor.actorId = value;
					actor.player.destroy();
					delete actor.data;
					delete actor.player;
					Scene.loadActorContext(actor);
				}
				break;
			case 'teamId':
				if (actor.teamId !== value) {
					actor.teamId = value;
					Scene.list.updateIcon(actor);
				}
				break;
			case 'angle':
				if (actor.angle !== value) {
					actor.angle = value;
					if (actor.player) {
						actor.player.setAngle(Math.radians(value));
					}
				}
				break;
			case 'scale':
				if (actor.scale !== value) {
					actor.scale = value;
					actor.player.setScale(value * (actor.data?.scale ?? 1));
				}
				break;
		}
		Scene.requestRendering();
	};

	SceneActor.datachange = function (event) {
		if (this.target && event.key === 'teams') {
			const elTeamId = $('#sceneActor-teamId');
			elTeamId.loadItems(Data.createTeamItems());
			this.target.teamId = '';
			elTeamId.update();
			elTeamId.dispatchEvent(new Event('input'));
		}
	}.bind(SceneActor);

	SceneActor.paramInput = function (event) {
		SceneActor.update(SceneActor.target, Inspector.getKey(this), this.read());
	};

	SceneActor.typeWrite = function (event) {
		switch (event.value) {
			case 'local':
				$('#sceneActor-scripts-detail').show();
				$('#sceneActor-parameter-pane').show();
				break;
			case 'global':
				$('#sceneActor-scripts-detail').hide();
				$('#sceneActor-parameter-pane').hide();
				break;
		}
	};

	Inspector.sceneActor = SceneActor;
}
