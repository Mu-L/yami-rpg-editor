import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Browser } from '@/browser/project-browser.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from './inspector.ts';
import { EventListInterface } from '@/tools/event-list.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';

{
	const FileTrigger = {
		target: null,
		meta: null,
		motions: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		animationIdWrite: null,
		paramInput: null,
		listChange: null
	};

	FileTrigger.initialize = function () {
		$('#fileTrigger-selector').loadItems([
			{ name: 'Enemy', value: 'enemy' },
			{ name: 'Friend', value: 'friend' },
			{ name: 'Team Member', value: 'team' },
			{ name: 'Team Member Except Self', value: 'team-except-self' },
			{ name: 'Any Except Self', value: 'any-except-self' },
			{ name: 'Any', value: 'any' }
		]);

		$('#fileTrigger-onHitWalls').loadItems([
			{ name: 'Penetrate', value: 'penetrate' },
			{ name: 'Destroy', value: 'destroy' }
		]);

		$('#fileTrigger-onHitActors').loadItems([
			{ name: 'Penetrate', value: 'penetrate' },
			{ name: 'Destroy', value: 'destroy' },
			{ name: 'Destroy After Multiple Hits', value: 'penetrate-destroy' }
		]);

		$('#fileTrigger-onHitActors')
			.enableHiddenMode()
			.relate([
				{
					case: 'penetrate-destroy',
					targets: [$('#fileTrigger-hitCount')]
				}
			]);

		$('#fileTrigger-shape-type').loadItems([
			{ name: 'Rectangle', value: 'rectangle' },
			{ name: 'Circle', value: 'circle' },
			{ name: 'Sector', value: 'sector' }
		]);

		$('#fileTrigger-shape-type')
			.enableHiddenMode()
			.relate([
				{
					case: 'rectangle',
					targets: [
						$('#fileTrigger-shape-width'),
						$('#fileTrigger-shape-height'),
						$('#fileTrigger-shape-anchor')
					]
				},
				{ case: 'circle', targets: [$('#fileTrigger-shape-radius')] },
				{
					case: 'sector',
					targets: [$('#fileTrigger-shape-radius'), $('#fileTrigger-shape-centralAngle')]
				}
			]);

		$('#fileTrigger-hitMode').loadItems([
			{ name: 'Once', value: 'once' },
			{ name: 'Once On Overlap', value: 'once-on-overlap' },
			{ name: 'Repeat', value: 'repeat' }
		]);

		$('#fileTrigger-hitMode')
			.enableHiddenMode()
			.relate([{ case: 'repeat', targets: [$('#fileTrigger-hitInterval')] }]);

		$('#fileTrigger-rotatable').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		]);

		$('#fileTrigger-events').bind(new EventListInterface(this));

		$('#fileTrigger-scripts').bind(new ScriptListInterface());

		$('#fileTrigger-parameter-pane').bind($('#fileTrigger-scripts'));

		$('#fileTrigger-animationId').on('write', this.animationIdWrite);
		$(`#fileTrigger-selector, #fileTrigger-onHitWalls, #fileTrigger-onHitActors, #fileTrigger-hitCount,
    #fileTrigger-shape-type, #fileTrigger-shape-width, #fileTrigger-shape-height,
    #fileTrigger-shape-anchor, #fileTrigger-shape-radius, #fileTrigger-shape-centralAngle,
    #fileTrigger-speed, #fileTrigger-hitMode, #fileTrigger-hitInterval,
    #fileTrigger-initialDelay, #fileTrigger-effectiveTime, #fileTrigger-duration,
    #fileTrigger-inherit, #fileTrigger-animationId, #fileTrigger-motion,
    #fileTrigger-priority, #fileTrigger-offsetY, #fileTrigger-rotatable
  `).on('input', this.paramInput);
		$('#fileTrigger-events, #fileTrigger-scripts').on('change', this.listChange);
	};

	FileTrigger.create = function () {
		return {
			selector: 'enemy',
			onHitWalls: 'penetrate',
			onHitActors: 'penetrate',
			hitCount: 2,
			shape: {
				type: 'circle',
				radius: 0.5
			},
			speed: 0,
			hitMode: 'once',
			hitInterval: 0,
			initialDelay: 0,
			effectiveTime: 0,
			duration: 0,
			inherit: '',
			animationId: '',
			motion: '',
			priority: 0,
			offsetY: 0,
			rotatable: true,
			events: [],
			scripts: []
		};
	};

	FileTrigger.open = function (trigger, meta) {
		if (this.meta !== meta) {
			this.target = trigger;
			this.meta = meta;

			const write = getElementWriter('fileTrigger', trigger);
			const shape = trigger.shape;
			write('selector');
			write('onHitWalls');
			write('onHitActors');
			write('hitCount');
			write('shape-type');
			write('shape-width', shape.width ?? 1);
			write('shape-height', shape.height ?? 1);
			write('shape-anchor', shape.anchor ?? 0.5);
			write('shape-radius', shape.radius ?? 0.5);
			write('shape-centralAngle', shape.centralAngle ?? 90);
			write('speed');
			write('hitMode');
			write('hitInterval');
			write('initialDelay');
			write('effectiveTime');
			write('duration');
			write('inherit');
			write('animationId');
			write('motion');
			write('priority');
			write('offsetY');
			write('rotatable');
			write('events');
			write('scripts');
		}
	};

	FileTrigger.close = function () {
		if (this.target) {
			Browser.unselect(this.meta);
			this.target = null;
			this.meta = null;
			this.motions = null;
			$('#fileTrigger-events').clear();
			$('#fileTrigger-scripts').clear();
			$('#fileTrigger-parameter-pane').clear();
		}
	};

	FileTrigger.update = function (trigger, key, value) {
		File.planToSave(this.meta);
		switch (key) {
			case 'selector':
			case 'onHitWalls':
			case 'onHitActors':
			case 'hitCount':
			case 'speed':
			case 'hitMode':
			case 'hitInterval':
			case 'initialDelay':
			case 'effectiveTime':
			case 'duration':
			case 'inherit':
				if (trigger[key] !== value) {
					trigger[key] = value;
				}
				break;
			case 'shape-type':
				if (trigger.shape.type !== value) {
					const read = getElementReader('fileTrigger-shape');
					switch (value) {
						case 'rectangle':
							trigger.shape = {
								type: 'rectangle',
								width: read('width'),
								height: read('height'),
								anchor: read('anchor')
							};
							break;
						case 'circle':
							trigger.shape = {
								type: 'circle',
								radius: read('radius')
							};
							break;
						case 'sector':
							trigger.shape = {
								type: 'sector',
								radius: read('radius'),
								centralAngle: read('centralAngle')
							};
							break;
					}
				}
				break;
			case 'shape-width':
			case 'shape-height':
			case 'shape-anchor':
			case 'shape-radius':
			case 'shape-centralAngle': {
				const index = key.indexOf('-') + 1;
				const property = key.slice(index);
				if (trigger.shape[property] !== value) {
					trigger.shape[property] = value;
				}
				break;
			}
			case 'animationId':
				if (trigger.animationId !== value) {
					trigger.animationId = value;
					FileTrigger.motions = null;
				}
				break;
			case 'motion':
			case 'priority':
			case 'offsetY':
			case 'rotatable':
				if (trigger[key] !== value) {
					trigger[key] = value;
				}
				break;
		}
	};

	FileTrigger.animationIdWrite = function (event) {
		const elMotion = $('#fileTrigger-motion');
		elMotion.loadItems(Animation.getMotionListItems(event.value));
		elMotion.write(elMotion.read());
	};

	FileTrigger.paramInput = function () {
		FileTrigger.update(FileTrigger.target, Inspector.getKey(this), this.read());
	};

	FileTrigger.listChange = function () {
		File.planToSave(FileTrigger.meta);
	};

	Inspector.fileTrigger = FileTrigger;
}
